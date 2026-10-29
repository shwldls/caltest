import '../data/drug_names.dart';
import '../models/drug_preset.dart';
import '../utils/pump_calculator_text.dart';

List<String> parseSearchAliases(String text) => text
    .split(RegExp(r'[,，\n]'))
    .map((name) => name.trim())
    .where((name) => name.isNotEmpty)
    .toSet()
    .toList();

List<DrugPreset> searchDrugPresets(List<DrugPreset> presets, String query) {
  final normalized = normalizeSearchText(query);
  if (normalized.isEmpty) return List.of(presets);

  final exactNames = drugNames
      .where((names) =>
          names.terms.any((term) => normalizeSearchText(term) == normalized))
      .firstOrNull;

  final tokens = query
      .split(RegExp(r'\s+'))
      .map(normalizeSearchText)
      .where((token) => token.isNotEmpty)
      .toList();
  final matches = <({DrugPreset preset, int rank, int index})>[];
  for (var index = 0; index < presets.length; index++) {
    final preset = presets[index];
    final names = namesForDrug(preset.name);
    if (exactNames != null &&
        names != null &&
        names != exactNames &&
        !preset.searchAliases
            .any((alias) => normalizeSearchText(alias) == normalized)) {
      continue;
    }
    final suffix = names == null
        ? ''
        : preset.name.trim().substring(names.matchName(preset.name)!.end);
    final aliases = [...?names?.terms, ...preset.searchAliases];
    final terms = <String>{
      preset.name,
      ...aliases,
      for (final alias in aliases) '$alias$suffix',
    }.map(normalizeSearchText).where((term) => term.isNotEmpty).toList();

    final rank = terms.any((term) => term == normalized)
        ? 0
        : terms.any((term) => term.startsWith(normalized))
            ? 1
            : terms.any((term) => term.contains(normalized))
                ? 2
                : tokens.every(
                        (token) => terms.any((term) => term.contains(token)))
                    ? 3
                    : null;
    if (rank != null) matches.add((preset: preset, rank: rank, index: index));
  }
  matches.sort((a, b) {
    final rankOrder = a.rank.compareTo(b.rank);
    return rankOrder != 0 ? rankOrder : a.index.compareTo(b.index);
  });
  return matches.map((match) => match.preset).toList();
}
