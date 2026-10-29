import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:micudrugtest/data/default_presets.dart';
import 'package:micudrugtest/data/drug_names.dart';
import 'package:micudrugtest/models/drug_preset.dart';
import 'package:micudrugtest/services/drug_search.dart';
import 'package:micudrugtest/services/preset_storage.dart';

void main() {
  test('English and Korean brand and ingredient find the same saved presets',
      () {
    final presets = defaultPresetMap()['micu']!;
    final expected = searchDrugPresets(presets, 'precedex');
    expect(expected, isNotEmpty);
    for (final query in ['PRECEDEX', '프리세덱스', 'dexmedetomidine', '덱스메데토미딘']) {
      expect(searchDrugPresets(presets, query), expected);
    }
  });

  test('generic search preserves separate concentrations and route variants',
      () {
    final presets = defaultPresetMap()['micu']!;
    final expected =
        presets.where((preset) => preset.name.startsWith('norphin')).toList();
    expect(expected.length, greaterThan(1));
    expect(searchDrugPresets(presets, 'norepinephrine'), expected);
    expect(searchDrugPresets(presets, '노르핀'), expected);
    expect(searchDrugPresets(presets, 'norpin'), expected);
    final filtered = searchDrugPresets(presets, '노르핀 pph');
    expect(filtered, isNotEmpty);
    expect(filtered.every((preset) => preset.name.contains('pph')), isTrue);
  });

  test('brand can be combined with strength and ignores whitespace and case',
      () {
    final presets = defaultPresetMap()['micu']!;
    final result = searchDrugPresets(presets, '  DIPRIVAN  1g / 50mL ');
    expect(result.single.name, 'propofol 1g/50mL');
    expect(result.single.drugAmount, 1);
    expect(result.single.drugUnit, 'g');
    expect(searchDrugPresets(presets, '디프리반1g/50mL'), result);
  });

  test('complete ingredient names do not conflate lookalike medications', () {
    final presets = defaultPresetMap()['ncu']!;
    final result = searchDrugPresets(presets, 'epinephrine');
    expect(result, isNotEmpty);
    expect(result.every((preset) => preset.name.startsWith('epinephrine')),
        isTrue);
    expect(
        namesForDrug('norepinephrine (central)')!.ingredient, 'norepinephrine');
    expect(namesForDrug('not-norepinephrine'), isNull);
    expect(namesForDrug('precedexlike custom medicine'), isNull);
  });

  test('empty and missing queries are predictable and do not mutate inputs',
      () {
    final presets = defaultPresetMap()['micu']!;
    final original = List.of(presets);
    expect(searchDrugPresets(presets, '  '), original);
    expect(searchDrugPresets(presets, '없는약물'), isEmpty);
    searchDrugPresets(presets, 'prop');
    expect(presets, original);
  });

  test('search keeps department boundaries and ranks exact matches first', () {
    final branded = _custom('Precedex 200mcg');
    final unrelated = _custom('Other drug');
    final result = searchDrugPresets([unrelated, branded], '덱스메데토미딘');
    expect(result, [branded]);
    expect(searchDrugPresets([unrelated], 'precedex'), isEmpty);
    expect(
        searchDrugPresets([_custom('prefixmatch'), _custom('prefix')], 'prefix')
            .first
            .name,
        'prefix');
  });

  test('custom aliases survive save reload copy and duplicate-id repair', () {
    final preset = _custom('병원 약물', aliases: ['상품명', '성분명']);
    final saved = upsertPreset([], preset);
    final restored = migratePresetMap(
        currentRaw: jsonEncode({
      'micu': saved.map((preset) => preset.toJson()).toList(),
    }))['micu']!;
    expect(searchDrugPresets(restored, '상품명').single.id, preset.id);
    expect(searchDrugPresets(restored, '성분명').single.id, preset.id);
    final copies = ensureUniquePresetIds([preset.copy(), preset.copy()]);
    expect(copies.map((item) => item.id).toSet().length, 2);
    expect(copies.every((item) => item.searchAliases.length == 2), isTrue);
    expect(parseSearchAliases(' 상품명, 성분명，상품명\n'), ['상품명', '성분명']);
  });

  test(
      'legacy JSON needs no alias migration and invalid alias data is rejected',
      () {
    final json = _custom('test').toJson()..remove('searchAliases');
    expect(DrugPreset.tryFromJson(json)!.searchAliases, isEmpty);
    expect(DrugPreset.tryFromJson({...json, 'searchAliases': 'bad'}), isNull);
    expect(
        DrugPreset.tryFromJson({
          ...json,
          'searchAliases': [1]
        }),
        isNull);
  });
}

DrugPreset _custom(String name, {List<String> aliases = const []}) =>
    DrugPreset(
      id: 'test-$name',
      name: name,
      doseUnit: 'mcg/kg/min',
      drugAmount: 1000,
      drugUnit: 'mcg',
      volumeMl: 50,
      timeUnit: 'min',
      useWeight: true,
      note: '',
      searchAliases: aliases,
    );
