#!/usr/bin/env python3
"""
Script to reformat the adventure file according to the Adventure Mechanics Guide.
Adds inline markers for items, combat, choices, and stat modifications.
"""

import re
import sys

def add_item_markers(text):
    """Add {item: ...} markers for items found in text."""
    changes = 0

    # Healing Potions
    text, count = re.subn(
        r'(\d+)\s+HEALING POTION(?:S)?\s*\((?:each\s+)?restores?\s+(\d+)\s+STAMINA\)',
        lambda m: f'{m.group(1)} {{item: Healing Potion | type=potion | restore=+{m.group(2)} stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'HEALING POTION\s*\(restores?\s+(\d+)\s+STAMINA\)',
        lambda m: f'{{item: Healing Potion | type=potion | restore=+{m.group(1)} stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Potion of Strength
    text, count = re.subn(
        r'POTION OF STRENGTH\s*\([^)]*\+(\d+)\s+SKILL[^)]*\)',
        lambda m: f'{{item: Potion of Strength | type=potion | bonus=+{m.group(1)} skill}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Potion of Luck
    text, count = re.subn(
        r'POTION OF LUCK',
        '{item: Potion of Luck | type=potion | restore=+3 luck}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Potion of Invisibility
    text, count = re.subn(
        r'POTION OF INVISIBILITY',
        '{item: Potion of Invisibility | type=potion | other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Silver Dagger
    text, count = re.subn(
        r'SILVER DAGGER\s*\(\+(\d+)\s+damage\s+vs\s+undead\)',
        lambda m: f'{{item: Silver Dagger | type=weapon | bonus=+{m.group(1)} attack}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # +1 Longsword
    text, count = re.subn(
        r'\+1 LONGSWORD(?:\s+OF\s+THE\s+HOLLOW\s+GUARD)?',
        '{item: +1 Longsword | type=weapon | bonus=+1 skill}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Blessed Silver Sword
    text, count = re.subn(
        r'BLESSED SILVER SWORD',
        '{item: Blessed Silver Sword | type=weapon | bonus=+2 skill}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # +1 Mace
    text, count = re.subn(
        r'\+1 MACE',
        '{item: +1 Mace | type=weapon | bonus=+1 skill}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Cloak of Protection
    text, count = re.subn(
        r'CLOAK OF PROTECTION',
        '{item: Cloak of Protection | type=armor | bonus=+1 defense}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Cloak of Shadows
    text, count = re.subn(
        r'CLOAK OF SHADOWS',
        '{item: Cloak of Shadows | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Holy Symbol
    text, count = re.subn(
        r'HOLY SYMBOL(?:\s+OF\s+BINDING)?',
        '{item: Holy Symbol | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Silver Ring
    text, count = re.subn(
        r'SILVER RING',
        '{item: Silver Ring | type=treasure}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Silver Amulet
    text, count = re.subn(
        r'SILVER AMULET',
        '{item: Silver Amulet | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Amulet of the Grave
    text, count = re.subn(
        r'AMULET OF THE GRAVE',
        '{item: Amulet of the Grave | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Gold Pieces
    text, count = re.subn(
        r'(\d+)\s+Gold\s+Pieces',
        lambda m: f'{{item: {m.group(1)} Gold Pieces | type=treasure}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Provisions
    text, count = re.subn(
        r'(\d+)\s+Provisions?',
        lambda m: f'{{item: {m.group(1)} Provisions | type=food | restore=+4 stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Keys
    text, count = re.subn(
        r'BRASS KEY',
        '{item: Brass Key | type=key}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'SILVER KEY',
        '{item: Silver Key | type=key}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'IRON KEY',
        '{item: Iron Key | type=key}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Rope
    text, count = re.subn(
        r'ROPE\s*\((?:50\s+feet)?\)',
        '{item: Rope | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Maps and Journals
    text, count = re.subn(
        r'MAYOR\'?S LEDGER',
        '{item: Mayor\'s Ledger | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'ALCHEMIST\'?S JOURNAL',
        '{item: Alchemist\'s Journal | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'(?:MAP OF THE )?MANOR(?:\s+(?:MAP|LAYOUT|SECRET PASSAGES MAP))',
        '{item: Manor Map | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    text, count = re.subn(
        r'CULT MEDALLION',
        '{item: Cult Medallion | type=other}',
        text, flags=re.IGNORECASE
    )
    changes += count

    return text, changes

def add_combat_markers(text):
    """Add {combat: ...} markers for combat encounters."""
    changes = 0

    # Pattern: ENEMY NAME SKILL X STAMINA Y
    text, count = re.subn(
        r'([A-Z][A-Z\s]+?)\s+SKILL\s+(\d+)\s+STAMINA\s+(\d+)\s*\n',
        lambda m: f'{{combat: {m.group(1).strip()} | skill={m.group(2)} | stamina={m.group(3)}}}\n',
        text
    )
    changes += count

    return text, changes

def add_choice_markers(text):
    """Convert 'Turn to N' statements to {choice: N | ...} format."""
    changes = 0

    # Pattern: Turn to N to do something
    text, count = re.subn(
        r'Turn to (\d+) to ([^\n]+)',
        lambda m: f'{{choice: {m.group(1)} | {m.group(2).strip()}}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Pattern: Turn to N (at end of line)
    text, count = re.subn(
        r'Turn to (\d+)\s*\.?\s*$',
        lambda m: f'{{choice: {m.group(1)} | Continue}}',
        text, flags=re.IGNORECASE | re.MULTILINE
    )
    changes += count

    return text, changes

def add_stat_modification_markers(text):
    """Add {action: ...} markers for stat modifications."""
    changes = 0

    # Reduce/Lose your SKILL by N
    text, count = re.subn(
        r'(?:Reduce|Lose)\s+your\s+SKILL\s+by\s+(\d+)',
        lambda m: f'{{action: -{m.group(1)} skill | Your skill is reduced}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Reduce/Lose your STAMINA by N
    text, count = re.subn(
        r'(?:Reduce|Lose)\s+your\s+STAMINA\s+by\s+(\d+)',
        lambda m: f'{{action: -{m.group(1)} stamina | Your stamina is reduced}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Lose N STAMINA
    text, count = re.subn(
        r'Lose\s+(\d+)\s+STAMINA',
        lambda m: f'{{action: -{m.group(1)} stamina | You lose stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Reduce/Lose your LUCK by N
    text, count = re.subn(
        r'(?:Reduce|Lose)\s+your\s+LUCK\s+by\s+(\d+)',
        lambda m: f'{{action: -{m.group(1)} luck | Your luck is reduced}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Add N LUCK
    text, count = re.subn(
        r'Add\s+(\d+)\s+LUCK',
        lambda m: f'{{action: +{m.group(1)} luck | You gain luck}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Restore N STAMINA
    text, count = re.subn(
        r'Restore\s+(\d+)\s+STAMINA',
        lambda m: f'{{action: +{m.group(1)} stamina | You restore stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Restore all STAMINA
    text, count = re.subn(
        r'Restore\s+all\s+STAMINA',
        '{action: restore stamina | Your stamina is fully restored}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Permanently lose N SKILL
    text, count = re.subn(
        r'Permanently\s+lose\s+(\d+)\s+SKILL',
        lambda m: f'{{action: -{m.group(1)} skill permanent | You permanently lose skill}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    # Permanently lose N STAMINA
    text, count = re.subn(
        r'Permanently\s+lose\s+(\d+)\s+(?:maximum\s+)?STAMINA',
        lambda m: f'{{action: -{m.group(1)} stamina permanent | You permanently lose stamina}}',
        text, flags=re.IGNORECASE
    )
    changes += count

    return text, changes

def main():
    input_file = '/home/user/turbo-palm-tree/CURSE_OF_HOLLOWS_END_FORMATTED.txt'
    output_file = input_file  # Overwrite the same file

    print(f"Reading adventure file: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print("Original file size:", len(content), "characters")

    # Apply transformations
    print("\nApplying transformations...")

    print("  - Adding item markers...")
    content, item_count = add_item_markers(content)
    print(f"    Added {item_count} item markers")

    print("  - Adding combat markers...")
    content, combat_count = add_combat_markers(content)
    print(f"    Added {combat_count} combat markers")

    print("  - Converting choice statements...")
    content, choice_count = add_choice_markers(content)
    print(f"    Converted {choice_count} choice statements")

    print("  - Adding stat modification markers...")
    content, stat_count = add_stat_modification_markers(content)
    print(f"    Added {stat_count} stat modification markers")

    print(f"\nTotal markers added: {item_count + combat_count + choice_count + stat_count}")
    print("New file size:", len(content), "characters")

    print(f"\nWriting reformatted adventure to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✓ Reformatting complete!")

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Item markers added:            {item_count}")
    print(f"Combat markers added:          {combat_count}")
    print(f"Choice markers converted:      {choice_count}")
    print(f"Stat modification markers:     {stat_count}")
    print(f"Total markers:                 {item_count + combat_count + choice_count + stat_count}")
    print("="*60)

if __name__ == '__main__':
    main()
