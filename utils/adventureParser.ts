import { Book, Item } from '@/types/game'

interface Metadata {
  title: string
  author?: string
  description?: string
  initialSkill: number
  initialStamina: number
  initialLuck: number
}

interface SectionData {
  id: number
  title?: string
  text: string
  choices: Array<{ text: string; targetSection: number }>
  combat?: {
    enemyName: string
    enemySkill: number
    enemyStamina: number
  }
  items?: Item[]
  isEnding: boolean
}

export function parseMetadata(text: string): Metadata {
  const metadata: Metadata = {
    title: '',
    author: '',
    description: '',
    initialSkill: 6,
    initialStamina: 14,
    initialLuck: 6,
  }

  const titleMatch = text.match(/(?:Title|TITLE|Adventure):\s*(.+)/i)
  const authorMatch = text.match(/(?:Author|By):\s*(.+)/i)
  const descMatch = text.match(/(?:Description|Desc):\s*(.+)/i)
  const skillMatch = text.match(/(?:Initial\s+)?SKILL:\s*(\d+)/i)
  const staminaMatch = text.match(/(?:Initial\s+)?STAMINA:\s*(\d+)/i)
  const luckMatch = text.match(/(?:Initial\s+)?LUCK:\s*(\d+)/i)

  if (titleMatch) metadata.title = titleMatch[1].trim()
  if (authorMatch) metadata.author = authorMatch[1].trim()
  if (descMatch) metadata.description = descMatch[1].trim()
  if (skillMatch) metadata.initialSkill = parseInt(skillMatch[1])
  if (staminaMatch) metadata.initialStamina = parseInt(staminaMatch[1])
  if (luckMatch) metadata.initialLuck = parseInt(luckMatch[1])

  return metadata
}

function findSections(text: string): Array<{ id: number; position: number; matchText: string }> {
  const sectionRegex = /(?:^#+\s*(?:Section|SECTION)\s+(\d+)(?:\s*\{[^}]*\})?|^(?:Section|SECTION)\s+(\d+)\s*(?:\]|:|\.|–|—)?|^\s*\[(\d+)\]|^\s*\((\d+)\)|^(\d+)[\.:]\s|^\s*\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim
  const sections: Array<{ id: number; position: number; matchText: string }> = []
  let match

  while ((match = sectionRegex.exec(text)) !== null) {
    const sectionNum = parseInt(
      match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7]
    )
    sections.push({
      id: sectionNum,
      position: match.index,
      matchText: match[0],
    })
  }

  return sections
}

function extractItems(content: string): Item[] {
  const items: Item[] = []

  const itemTypeKeywords: Record<string, string[]> = {
    weapon: ['sword', 'axe', 'bow', 'dagger', 'blade', 'staff', 'wand', 'mace', 'spear', 'crossbow'],
    armor: ['shield', 'helmet', 'armor', 'mail', 'breastplate', 'gauntlet', 'boots'],
    potion: ['potion', 'elixir', 'tonic', 'brew'],
    treasure: ['gold', 'coins', 'gems', 'treasure', 'jewel', 'jewels', 'diamond', 'ruby', 'emerald', 'loot', 'sapphire'],
    key: ['key'],
    other: ['ring', 'amulet', 'scroll', 'map', 'book', 'rope', 'torch', 'lantern'],
  }

  const itemNouns = [
    'sword', 'axe', 'bow', 'dagger', 'blade', 'staff', 'wand', 'mace', 'spear', 'crossbow',
    'shield', 'helmet', 'armor', 'mail', 'breastplate', 'gauntlet', 'boots',
    'potion', 'elixir', 'tonic', 'brew',
    'key', 'ring', 'amulet', 'scroll', 'map', 'book', 'rope', 'torch', 'lantern',
    'treasure', 'loot', 'gems', 'jewels', 'diamond', 'ruby', 'emerald', 'sapphire'
  ]

  const adjectives = [
    'healing', 'magic', 'enchanted', 'rusty', 'golden', 'silver', 'iron', 'bronze',
    'steel', 'ancient', 'old', 'new', 'heavy', 'light', 'sharp', 'dull', 'bright',
    'dark', 'mysterious', 'cursed', 'blessed', 'holy'
  ]

  const processedItems = new Set<string>()

  // Pattern 1: "[number] gold coins"
  const goldPattern = /(\d+)\s+(?:gold\s+)?coins?/gi
  let match
  while ((match = goldPattern.exec(content)) !== null) {
    const count = match[1]
    const itemId = `${count}-gold-coins`
    if (!processedItems.has(itemId)) {
      processedItems.add(itemId)
      items.push({
        id: itemId,
        name: `${count} Gold Coins`,
        type: 'treasure',
      })
    }
  }

  // Pattern 2: "you [verb] (a/an/the) [adjective?] [item-noun]"
  const actionVerbs = 'find|discover|gain|obtain|receive|pick\\s+up|take|grab|acquire'
  const adjectivePattern = `(?:${adjectives.join('|')})?`
  const itemPattern = `(?:${itemNouns.join('|')})`

  const actionItemRegex = new RegExp(
    `(?:you\\s+(?:${actionVerbs})\\s+(?:a|an|the)?\\s*)` +
    `(${adjectivePattern}\\s*${itemPattern})`,
    'gi'
  )

  while ((match = actionItemRegex.exec(content)) !== null) {
    let itemName = match[1].trim()
    if (!itemName) continue

    itemName = itemName.replace(/\s+/g, ' ')
    const itemId = itemName.toLowerCase().replace(/\s+/g, '-')

    if (processedItems.has(itemId)) continue
    processedItems.add(itemId)

    let itemType: string = 'other'
    const lowerItemName = itemName.toLowerCase()
    const words = lowerItemName.split(/\s+/)
    const lastWord = words[words.length - 1]

    for (const [type, keywords] of Object.entries(itemTypeKeywords)) {
      if (keywords.includes(lastWord)) {
        itemType = type
        break
      }
    }

    const capitalizedName = itemName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    items.push({
      id: itemId,
      name: capitalizedName,
      type: itemType as Item['type'],
    })
  }

  return items
}

function extractSectionContent(text: string, sections: Array<{ id: number; position: number; matchText: string }>): SectionData[] {
  const parsed: SectionData[] = []

  for (let i = 0; i < sections.length; i++) {
    const current = sections[i]
    const next = sections[i + 1]

    const startPos = current.position + current.matchText.length
    const endPos = next ? next.position : text.length
    const content = text.substring(startPos, endPos).trim()

    // Extract title
    const lines = content.split('\n')
    const titleMatch = lines[0]?.match(/^([^\n]+?)(?:\n|$)/)
    const title = titleMatch && titleMatch[1].length < 100 ? titleMatch[1].trim() : ''

    // Extract choices
    const choiceRegex = /(?:(?:turn|go|proceed|move|continue|head|return)(?:\s+(?:to|back to|forward to))?\s+(?:section\s+)?(\d+)|\[(\d+)\]\([^\)]*\))/gi
    const choices: Array<{ text: string; targetSection: number }> = []
    let choiceMatch

    while ((choiceMatch = choiceRegex.exec(content)) !== null) {
      const targetSection = parseInt(choiceMatch[1] || choiceMatch[2])
      choices.push({
        targetSection: targetSection,
        text: choiceMatch[0],
      })
    }

    // Extract combat
    const combatMatch = content.match(/([A-Z\s]+?)\s+(?:SKILL|Skill)\s+(\d+)(?:,|\s+)(?:STAMINA|Stamina)\s+(\d+)/i)
    let combat

    if (combatMatch) {
      combat = {
        enemyName: combatMatch[1].trim(),
        enemySkill: parseInt(combatMatch[2]),
        enemyStamina: parseInt(combatMatch[3]),
      }
    }

    // Extract items
    const items = extractItems(content)

    // Check for endings
    const endingMatch = content.match(/(?:you have won|victory|you have succeeded|the end|you have died|you are dead|game over)/i)
    const isEnding = current.id === 999 || current.id === 400 || endingMatch !== null

    parsed.push({
      id: current.id,
      title,
      text: content,
      choices,
      combat,
      items: items.length > 0 ? items : undefined,
      isEnding,
    })
  }

  return parsed
}

export function convertTextToBook(text: string): Book {
  const metadata = parseMetadata(text)
  const sections = findSections(text)
  const parsedSections = extractSectionContent(text, sections)

  if (!metadata.title) {
    throw new Error('Missing title. Add "Title: Your Adventure Name" to the beginning of your file.')
  }

  if (parsedSections.length === 0) {
    throw new Error('No sections found. Use format "Section 1", "[1]", or "## SECTION 1" to mark sections.')
  }

  const hasSection1 = parsedSections.some(s => s.id === 1)
  if (!hasSection1) {
    throw new Error('Missing Section 1. Adventures must start with section 1.')
  }

  const book: Book = {
    id: metadata.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    title: metadata.title,
    author: metadata.author,
    description: metadata.description,
    startingSection: 1,
    initialStats: {
      skill: metadata.initialSkill,
      stamina: metadata.initialStamina,
      luck: metadata.initialLuck,
    },
    sections: parsedSections.map(section => {
      const jsonSection: any = {
        id: section.id,
        text: section.text,
      }

      if (section.title) {
        jsonSection.title = section.title
      }

      if (section.choices.length > 0) {
        jsonSection.choices = section.choices.map(choice => ({
          text: choice.text,
          targetSection: choice.targetSection,
        }))
      }

      if (section.combat) {
        jsonSection.combat = {
          enemyName: section.combat.enemyName,
          enemySkill: section.combat.enemySkill,
          enemyStamina: section.combat.enemyStamina,
          onVictorySection: section.choices[0]?.targetSection || section.id + 1,
          onDefeatSection: 999,
        }
      }

      if (section.items && section.items.length > 0) {
        jsonSection.addItems = section.items
      }

      if (section.isEnding) {
        jsonSection.isEnding = true

        if (section.id === 999 || section.text.match(/you have died|you are dead|game over/i)) {
          jsonSection.endingType = 'defeat'
        } else if (section.text.match(/you have won|victory|you have succeeded/i)) {
          jsonSection.endingType = 'victory'
        } else {
          jsonSection.endingType = 'neutral'
        }
      }

      return jsonSection
    }),
  }

  return book
}
