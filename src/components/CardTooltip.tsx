import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { CardDefinition, CombatContext } from '../types';
import { COLORS } from '../constants/theme';
import { computeCardPreview } from '../utils/gameLogic';

interface Props {
  definition: CardDefinition | null;
  onClose: () => void;
  combatCtx?: CombatContext;
  overrideCost?: number;
}

const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  exhaust: 'Exhaust: This card is removed from combat after being played (goes to exhaust pile, not discard).',
  innate: 'Innate: This card always appears in your opening hand at the start of combat.',
  retain: 'Retain: This card stays in your hand when you end your turn instead of going to discard.',
  vulnerable: 'Vulnerable: The affected entity takes 50% more damage from attacks.',
  weak: 'Weak: The affected entity deals 25% less damage with attacks.',
  frail: 'Frail: The affected entity gains 25% less block.',
  poison: 'Poison: At the end of each turn, deal damage equal to stacks, then remove 1 stack.',
  strength: 'Strength: Increases all attack damage by the stack count (permanently).',
  dexterity: 'Dexterity: Increases all block gained by the stack count (permanently).',
  metallicize: 'Metallicize: Gain block equal to stacks at the start of each turn.',
};

const CATEGORY_COLORS: Record<string, string> = {
  attack: '#e74c3c',
  defense: '#4fc3f7',
  combo: '#f5a623',
  status: '#9b59b6',
  power: '#66bb6a',
};

export default function CardTooltip({ definition, onClose, combatCtx, overrideCost }: Props) {
  if (!definition) return null;

  const preview = combatCtx ? computeCardPreview(definition, combatCtx) : null;

  const color = CATEGORY_COLORS[definition.category] ?? '#fff';

  // Extract keywords from description
  const keywords: string[] = [];
  const descLower = definition.description.toLowerCase();
  if (definition.exhaust || descLower.includes('exhaust')) keywords.push('exhaust');
  if (definition.innate) keywords.push('innate');
  if (definition.retain) keywords.push('retain');
  if (descLower.includes('vulnerable')) keywords.push('vulnerable');
  if (descLower.includes('weak')) keywords.push('weak');
  if (descLower.includes('poison')) keywords.push('poison');
  if (descLower.includes('strength')) keywords.push('strength');
  if (descLower.includes('dexterity')) keywords.push('dexterity');
  if (descLower.includes('metallicize')) keywords.push('metallicize');

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: color + '22', borderBottomColor: color }]}>
            <View style={[styles.costCircle, { backgroundColor: color }]}>
              <Text style={styles.costText}>{definition.cost === -1 ? 'X' : definition.cost}</Text>
            </View>
            <Text style={[styles.name, { color }]}>{definition.name}</Text>
            {definition.rarity && (
              <Text style={[styles.rarity, {
                color: definition.rarity === 'rare' ? '#f9a825' : definition.rarity === 'uncommon' ? '#5c6bc0' : '#9e9e9e',
              }]}>
                {definition.rarity.toUpperCase()}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.body}>
            <Text style={styles.desc}>{definition.description}</Text>

            {/* Live preview with modifiers */}
            {preview && (preview.damage || preview.block) && (
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>With current modifiers:</Text>
                {preview.damage !== undefined && (
                  <Text style={styles.previewDmg}>⚔️ Deals {preview.damage} damage</Text>
                )}
                {preview.block !== undefined && (
                  <Text style={styles.previewBlk}>🛡️ Gains {preview.block} block</Text>
                )}
                {preview.draw !== undefined && (
                  <Text style={styles.previewDraw}>🃏 Draws {preview.draw} cards</Text>
                )}
              </View>
            )}

            {/* Keywords */}
            {keywords.length > 0 && (
              <View style={styles.keywordSection}>
                <View style={styles.keywordDivider} />
                {keywords.map((kw) => (
                  <View key={kw} style={styles.keywordItem}>
                    <Text style={styles.keywordTitle}>{kw.charAt(0).toUpperCase() + kw.slice(1)}</Text>
                    <Text style={styles.keywordDesc}>{KEYWORD_DESCRIPTIONS[kw]}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Type badge */}
            <View style={[styles.typeBadge, { borderColor: color }]}>
              <Text style={[styles.typeText, { color }]}>
                {definition.category.toUpperCase()}
                {definition.upgraded ? ' (UPGRADED)' : ''}
              </Text>
            </View>
          </View>

          <Text style={styles.hint}>Tap anywhere to close</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
  },
  costCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  rarity: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },

  body: { padding: 16, gap: 12 },
  desc: { color: '#e0e0e0', fontSize: 15, lineHeight: 22 },

  keywordSection: { gap: 8 },
  keywordDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 4 },
  keywordItem: { gap: 2 },
  keywordTitle: { color: COLORS.accentGold, fontSize: 13, fontWeight: 'bold' },
  keywordDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },

  typeBadge: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },

  hint: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', paddingBottom: 12 },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewTitle: { color: COLORS.accentGold, fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  previewDmg: { color: '#e74c3c', fontSize: 13, fontWeight: 'bold' },
  previewBlk: { color: '#4fc3f7', fontSize: 13, fontWeight: 'bold' },
  previewDraw: { color: '#9b59b6', fontSize: 13, fontWeight: 'bold' },
});
