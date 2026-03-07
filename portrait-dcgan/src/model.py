"""
model.py — PortraitGAN Generator and Discriminator

Architecture: Conditional DCGAN with projection discriminator.
The generator takes a noise vector + condition embedding and produces 64×64 RGB.
The discriminator takes an image + condition embedding and outputs real/fake.

Key design choices:
  - Projection discriminator (Miyato & Koyama 2018) for stable conditioning
  - Spectral normalization on discriminator for training stability
  - Batch normalization + ReLU in generator
  - Instance normalization option for generator (better for diverse conditions)
  - Condition injected at every resolution stage (not just the first layer)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from src.labels import DIM_SIZES, EMBED_DIM_PER_DIM, CONDITION_DIM, NUM_DIMS


# ─────────────────────────────────────────────────────────────────────────────
# HYPERPARAMETERS
# ─────────────────────────────────────────────────────────────────────────────

IMG_SIZE     = 64       # Output image resolution. Set to 128 for higher quality.
NC           = 3        # Number of color channels (RGB)
NZ           = 128      # Noise vector dimension
NGF          = 64       # Generator feature map base width
NDF          = 64       # Discriminator feature map base width
COND_DIM     = CONDITION_DIM  # = 112 (7 dims × 16-d per dim)


# ─────────────────────────────────────────────────────────────────────────────
# CONDITION EMBEDDING MODULE
# ─────────────────────────────────────────────────────────────────────────────

class ConditionEmbedding(nn.Module):
    """
    Converts a [B, 7] tensor of condition indices into a [B, COND_DIM] vector.

    Uses separate learnable embedding tables for each of the 7 condition
    dimensions, then concatenates them. This lets each dimension be learned
    independently, avoiding interference between e.g. age and hair color.
    """
    def __init__(self):
        super().__init__()
        self.embeds = nn.ModuleList([
            nn.Embedding(dim_size, EMBED_DIM_PER_DIM)
            for dim_size in DIM_SIZES.values()
        ])
        # Project concatenated embeddings to final condition dim
        self.proj = nn.Sequential(
            nn.Linear(COND_DIM, COND_DIM),
            nn.LeakyReLU(0.2, inplace=True),
        )

    def forward(self, cond_indices):
        # cond_indices: [B, 7] integer tensor
        embedded = [emb(cond_indices[:, i]) for i, emb in enumerate(self.embeds)]
        concat = torch.cat(embedded, dim=1)  # [B, COND_DIM]
        return self.proj(concat)             # [B, COND_DIM]


# ─────────────────────────────────────────────────────────────────────────────
# GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class ResBlock(nn.Module):
    """Residual block for the generator bottleneck."""
    def __init__(self, channels):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(channels, channels, 3, 1, 1, bias=False),
            nn.BatchNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, 3, 1, 1, bias=False),
            nn.BatchNorm2d(channels),
        )

    def forward(self, x):
        return x + self.net(x)


class CondBatchNorm(nn.Module):
    """
    Conditional Batch Normalization.
    Learns separate scale (γ) and shift (β) parameters per condition vector.
    This is the standard way to inject conditioning into intermediate layers.
    """
    def __init__(self, num_features, cond_dim):
        super().__init__()
        self.bn = nn.BatchNorm2d(num_features, affine=False)
        self.gamma_proj = nn.Linear(cond_dim, num_features)
        self.beta_proj  = nn.Linear(cond_dim, num_features)
        # Initialize scale to 1, shift to 0
        nn.init.ones_(self.gamma_proj.weight)
        nn.init.zeros_(self.gamma_proj.bias)
        nn.init.zeros_(self.beta_proj.weight)
        nn.init.zeros_(self.beta_proj.bias)

    def forward(self, x, cond):
        # x:    [B, C, H, W]
        # cond: [B, cond_dim]
        x_bn = self.bn(x)
        gamma = self.gamma_proj(cond).unsqueeze(-1).unsqueeze(-1)  # [B,C,1,1]
        beta  = self.beta_proj(cond).unsqueeze(-1).unsqueeze(-1)   # [B,C,1,1]
        return gamma * x_bn + beta


class GeneratorBlock(nn.Module):
    """
    One upsampling stage: 2× spatial resolution, conditioned via CBN.
    """
    def __init__(self, in_ch, out_ch, cond_dim):
        super().__init__()
        self.conv = nn.ConvTranspose2d(in_ch, out_ch, 4, 2, 1, bias=False)
        self.cbn  = CondBatchNorm(out_ch, cond_dim)
        self.act  = nn.ReLU(inplace=True)

    def forward(self, x, cond):
        return self.act(self.cbn(self.conv(x), cond))


class Generator(nn.Module):
    """
    Conditional DCGAN Generator for 64×64 portrait images.

    Input:
        z:    [B, NZ]     — noise vector (standard normal)
        cond: [B, 7]      — integer condition indices (one per dimension)

    Output:
        img:  [B, 3, 64, 64] — generated image in [-1, 1]

    Architecture (with 64×64 output):
        Input projection: (NZ + COND_DIM) → 4×4×(8·NGF)
        Stage 1: 4×4  → 8×8   (8·NGF → 4·NGF) with CBN
        Stage 2: 8×8  → 16×16 (4·NGF → 2·NGF) with CBN
        Stage 3: 16×16→ 32×32 (2·NGF →   NGF) with CBN
        Stage 4: 32×32→ 64×64 (  NGF →    3 ) with Tanh
    """
    def __init__(self, nz=NZ, ngf=NGF, cond_dim=COND_DIM):
        super().__init__()
        self.nz = nz
        self.cond_embed = ConditionEmbedding()

        # Project noise + condition to initial 4×4 spatial feature map
        self.input_proj = nn.Sequential(
            nn.Linear(nz + cond_dim, 4 * 4 * ngf * 8, bias=False),
            nn.ReLU(inplace=True),
        )

        # Residual blocks at the bottleneck (4×4)
        self.res1 = ResBlock(ngf * 8)
        self.res2 = ResBlock(ngf * 8)

        # Upsampling stages, each conditioned
        self.up1 = GeneratorBlock(ngf * 8, ngf * 4, cond_dim)  # 4→8
        self.up2 = GeneratorBlock(ngf * 4, ngf * 2, cond_dim)  # 8→16
        self.up3 = GeneratorBlock(ngf * 2, ngf,     cond_dim)  # 16→32
        self.up4 = GeneratorBlock(ngf,     ngf // 2, cond_dim) # 32→64

        # Final output conv: reduce to 3 channels
        self.output_conv = nn.Sequential(
            nn.Conv2d(ngf // 2, 3, 3, 1, 1, bias=True),
            nn.Tanh()
        )

        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, (nn.Conv2d, nn.ConvTranspose2d)):
                nn.init.normal_(m.weight, 0.0, 0.02)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.normal_(m.weight, 1.0, 0.02)
                nn.init.zeros_(m.bias)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0.0, 0.02)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, z, cond_indices):
        """
        z:           [B, NZ]
        cond_indices:[B, 7]  — integer condition indices
        returns:     [B, 3, 64, 64]
        """
        cond = self.cond_embed(cond_indices)          # [B, COND_DIM]
        x = torch.cat([z, cond], dim=1)               # [B, NZ + COND_DIM]
        x = self.input_proj(x)                        # [B, 4*4*ngf*8]
        x = x.view(-1, self.nz * 8 // (self.nz // 8 * 2), 4, 4)
        # Simpler:
        ngf8 = 64 * 8  # = 512
        x = x.view(-1, ngf8, 4, 4)
        x = self.res1(x)
        x = self.res2(x)
        x = self.up1(x, cond)
        x = self.up2(x, cond)
        x = self.up3(x, cond)
        x = self.up4(x, cond)
        return self.output_conv(x)


# ─────────────────────────────────────────────────────────────────────────────
# DISCRIMINATOR (training only — not deployed)
# ─────────────────────────────────────────────────────────────────────────────

def spectral_norm(module):
    return nn.utils.spectral_norm(module)


class DiscriminatorBlock(nn.Module):
    """One downsampling stage with spectral normalization."""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            spectral_norm(nn.Conv2d(in_ch, out_ch, 4, 2, 1, bias=False)),
            nn.LeakyReLU(0.2, inplace=True),
        )

    def forward(self, x):
        return self.net(x)


class Discriminator(nn.Module):
    """
    Projection discriminator for conditional image discrimination.
    Uses spectral normalization throughout for stable GAN training.

    Input:
        img:  [B, 3, 64, 64]
        cond: [B, 7]  — same condition indices as the generator

    Output:
        score: [B, 1]  — logit (positive = real, negative = fake)

    Architecture:
        64×64 → 32×32 (ndf)
        32×32 → 16×16 (ndf×2)
        16×16 → 8×8   (ndf×4)
        8×8   → 4×4   (ndf×8)
        4×4 feature map → global avg pool → projection with condition
    """
    def __init__(self, ndf=NDF, cond_dim=COND_DIM):
        super().__init__()
        self.cond_embed = ConditionEmbedding()

        self.down1 = DiscriminatorBlock(3,       ndf)      # 64→32
        self.down2 = DiscriminatorBlock(ndf,     ndf * 2)  # 32→16
        self.down3 = DiscriminatorBlock(ndf * 2, ndf * 4)  # 16→8
        self.down4 = DiscriminatorBlock(ndf * 4, ndf * 8)  # 8→4

        # Final conv to 1×1
        self.final_conv = spectral_norm(
            nn.Conv2d(ndf * 8, ndf * 8, 4, 1, 0, bias=False)
        )

        # Unconditional output head
        self.out_linear = spectral_norm(nn.Linear(ndf * 8, 1))

        # Projection head: inner product with condition embedding
        self.cond_proj = spectral_norm(nn.Linear(cond_dim, ndf * 8, bias=False))

        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.normal_(m.weight, 0.0, 0.02)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0.0, 0.02)

    def forward(self, img, cond_indices):
        """
        img:         [B, 3, 64, 64]
        cond_indices:[B, 7]
        returns:     [B, 1] logit
        """
        cond = self.cond_embed(cond_indices)   # [B, COND_DIM]

        h = self.down1(img)
        h = self.down2(h)
        h = self.down3(h)
        h = self.down4(h)
        h = self.final_conv(h)                 # [B, ndf*8, 1, 1]
        h = h.view(h.size(0), -1)              # [B, ndf*8]

        # Unconditional score
        score = self.out_linear(h)             # [B, 1]

        # Projection score (condition-aware)
        proj = (h * self.cond_proj(cond)).sum(dim=1, keepdim=True)  # [B, 1]

        return score + proj


# ─────────────────────────────────────────────────────────────────────────────
# PARAMETER COUNT UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def count_params(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def model_size_mb(model):
    total = sum(p.numel() * p.element_size() for p in model.parameters())
    return total / (1024 ** 2)


if __name__ == "__main__":
    import torch

    G = Generator()
    D = Discriminator()

    batch = 4
    z = torch.randn(batch, NZ)
    cond = torch.zeros(batch, NUM_DIMS, dtype=torch.long)
    cond[:, 0] = 3   # family
    cond[:, 2] = 2   # east_asian

    fake = G(z, cond)
    score = D(fake, cond)

    print("=== PortraitGAN Architecture ===")
    print(f"Generator:     {count_params(G):>10,} params  |  {model_size_mb(G):.1f} MB (fp32)")
    print(f"Discriminator: {count_params(D):>10,} params  |  {model_size_mb(D):.1f} MB (fp32)")
    print(f"Generator output shape: {fake.shape}")
    print(f"Discriminator score shape: {score.shape}")
    print(f"Output range: [{fake.min():.3f}, {fake.max():.3f}]")
