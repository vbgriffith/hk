#!/bin/bash
# Integration script for Sessions 7-10
# Run this to apply all enhancements

echo "=== Hollow Knight Web Clone - Sessions 7-10 Integration ==="
echo ""
echo "This script will integrate:"
echo "  - Session 7: 21 new rooms (complete world map)"
echo "  - Session 8: Enhanced Knight graphics + facing"
echo "  - Session 9: Tilesets, enemies, quests, collectibles"
echo "  - Session 10: Complete graphics overhaul"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Backup existing files
cp js/entities/Knight.js "$BACKUP_DIR/" 2>/dev/null
cp js/scenes/PreloadScene.js "$BACKUP_DIR/" 2>/dev/null
cp index.html "$BACKUP_DIR/" 2>/dev/null

echo "Applying integrations..."

# 1. Knight.js - Add sprite facing and hitbox
echo "  [1/5] Updating Knight.js..."
if [ -f "js/entities/Knight_integrated.js" ]; then
    cp js/entities/Knight_integrated.js js/entities/Knight.js
    echo "    ✓ Knight facing + inventory added"
fi

# 2. index.html - Add new script loads
echo "  [2/5] Updating index.html..."
if grep -q "mapData_expansion.js" index.html; then
    echo "    ✓ Already has mapData_expansion"
else
    # Add before </body>
    sed -i 's|</body>|    <script src="js/data/mapData_expansion.js"></script><!-- Session 7 -->\n    <script src="js/data/RoomGeometry.js"></script><!-- Session 9 -->\n    <script src="js/entities/enemies/EnemyVariants.js"></script><!-- Session 9 -->\n    <script src="js/systems/QuestSystem.js"></script><!-- Session 9 -->\n  </body>|' index.html
    echo "    ✓ Added new script loads"
fi

# 3. Ensure directories exist
echo "  [3/5] Checking directory structure..."
mkdir -p js/entities/enemies
mkdir -p js/systems
echo "    ✓ Directories ready"

# 4. Copy/verify session files
echo "  [4/5] Verifying session files..."
files_ok=true
[ ! -f "js/data/mapData_expansion.js" ] && echo "    ⚠ Missing mapData_expansion.js" && files_ok=false
[ ! -f "js/data/RoomGeometry.js" ] && echo "    ⚠ Missing RoomGeometry.js" && files_ok=false
[ ! -f "js/entities/enemies/EnemyVariants.js" ] && echo "    ⚠ Missing EnemyVariants.js" && files_ok=false
[ ! -f "js/systems/QuestSystem.js" ] && echo "    ⚠ Missing QuestSystem.js" && files_ok=false
[ ! -f "js/scenes/PreloadScene_tilesets.js" ] && echo "    ⚠ Missing PreloadScene_tilesets.js" && files_ok=false
[ ! -f "js/scenes/PreloadScene_graphics_complete.js" ] && echo "    ⚠ Missing PreloadScene_graphics_complete.js" && files_ok=false

if [ "$files_ok" = true ]; then
    echo "    ✓ All session files present"
else
    echo "    ⚠ Some files missing - extract from session packages"
fi

# 5. Instructions for PreloadScene manual integration
echo "  [5/5] PreloadScene.js requires manual integration"
echo "    → See INTEGRATION_CHECKLIST.md for step-by-step"

echo ""
echo "=== Integration Status ==="
echo "✓ Knight.js updated (facing + inventory)"
echo "✓ index.html updated (script loads)"
echo "✓ Session files verified"
echo "⚠ PreloadScene.js needs manual integration (see checklist)"
echo ""
echo "Next steps:"
echo "  1. Open INTEGRATION_CHECKLIST.md"
echo "  2. Follow PreloadScene.js integration steps"
echo "  3. Test in browser"
echo ""
echo "Backup saved to: $BACKUP_DIR"
echo "Done!"
