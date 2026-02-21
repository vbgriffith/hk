// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Inventory UI
// ════════════════════════════════════════════════════════════

class InventoryUI {
  constructor() {
    this.visible = false;
    this.panel = document.getElementById('inventory-panel');
    this.grid = document.getElementById('inventory-grid');
    this.detail = document.getElementById('inventory-detail');
    this.detailName = document.getElementById('inv-detail-name');
    this.detailDesc = document.getElementById('inv-detail-desc');

    document.getElementById('inv-detail-close')?.addEventListener('click', () => {
      this.detail?.classList.add('hidden');
    });

    // Close buttons
    document.querySelectorAll('[data-closes="inventory-panel"]').forEach(btn => {
      btn.addEventListener('click', () => this.hide());
    });
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  show() {
    this.visible = true;
    this.render();
    this.panel?.classList.remove('hidden');
    requestAnimationFrame(() => this.panel?.classList.add('visible'));
  }

  hide() {
    this.visible = false;
    this.panel?.classList.remove('visible');
    setTimeout(() => this.panel?.classList.add('hidden'), 380);
  }

  render() {
    if (!this.grid) return;
    this.grid.innerHTML = '';

    // Items come from gameState.inventory (Set of item IDs)
    const items = gameState.inventory ? Array.from(gameState.inventory) : [];

    if (items.length === 0) {
      this.grid.innerHTML = `
        <div style="grid-column:1/-1;padding:1rem;font-family:var(--font-body);
          font-size:0.82rem;font-style:italic;color:var(--parchment-dim);text-align:center;
          line-height:1.6;">
          No items collected yet.<br>Examine your surroundings.
        </div>`;
      return;
    }

    items.forEach(itemId => {
      const item = STORY.inventory?.[itemId];
      if (!item) return;

      const el = document.createElement('div');
      el.className = `inv-item${item.weight === 'critical' ? ' critical-item' : ''}`;
      el.innerHTML = `
        <div class="inv-item-icon">${item.icon || '📄'}</div>
        <div class="inv-item-name">${item.name}</div>
      `;
      el.addEventListener('click', () => this.showDetail(item));
      this.grid.appendChild(el);
    });
  }

  showDetail(item) {
    if (!this.detail) return;
    if (this.detailName) this.detailName.textContent = item.name;
    if (this.detailDesc) this.detailDesc.textContent = item.description;
    this.detail.classList.remove('hidden');
  }
}

const inventoryUI = new InventoryUI();

// Extend STORY with inventory items (physical objects player carries)
STORY.inventory = {
  pharmacy_receipt: {
    id: 'pharmacy_receipt',
    name: 'Pharmacy Receipt',
    icon: '🧾',
    description: 'Greystone Compounding, Ltd. — October 9th. The compound purchased is partially legible.',
    weight: 'critical'
  },
  shed_key: {
    id: 'shed_key',
    name: 'Brass Key',
    icon: '🗝',
    description: 'A small brass key. Found under the third porch step. Fits a padlock.',
    weight: 'key_item'
  },
  safety_deposit_key: {
    id: 'safety_deposit_key',
    name: 'Safety Deposit Key',
    icon: '🔑',
    description: 'Key to Vault No. 114, Whitmore National Bank. Found in a tin box.',
    weight: 'key_item'
  },
  confession_letter: {
    id: 'confession_letter',
    name: "Elias's Confession",
    icon: '📜',
    description: 'A sealed letter in Elias\'s hand. He admits to being Tomas Vey. Names Jonas Merrill.',
    weight: 'revelatory'
  },
  new_will_draft: {
    id: 'new_will_draft',
    name: 'Draft Will',
    icon: '📋',
    description: 'Nathaniel\'s inheritance reduced to 8%. Notation: "Pending my disclosure."',
    weight: 'critical'
  },
  tomas_vey_photo: {
    id: 'tomas_vey_photo',
    name: 'Old Photograph',
    icon: '🖼',
    description: 'A young man, early 1970s. Not the face from the manor portraits. His name is written on the back: Tomas Vey.',
    weight: 'revelatory'
  },
  toxicology_report: {
    id: 'toxicology_report',
    name: 'Toxicology Report',
    icon: '🔬',
    description: 'Dr. Crane\'s private screen. Digitalis derivative detected in Elias\'s blood. Dated October 17th.',
    weight: 'critical'
  }
};

// Also extend gameState with inventory support
if (!gameState.inventory) {
  gameState.inventory = new Set();
}

const _origSerialize = gameState.serialize.bind(gameState);
gameState.serialize = function() {
  const base = JSON.parse(_origSerialize());
  base.inventory = Array.from(this.inventory);
  return JSON.stringify(base);
};

const _origDeserialize = gameState.deserialize.bind(gameState);
gameState.deserialize = function(json) {
  const result = _origDeserialize(json);
  try {
    const data = JSON.parse(json);
    this.inventory = new Set(data.inventory || []);
  } catch(e) {}
  return result;
};

gameState.addItem = function(itemId) {
  if (!this.inventory.has(itemId)) {
    this.inventory.add(itemId);
    return true;
  }
  return false;
};
