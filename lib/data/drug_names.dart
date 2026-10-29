class DrugNames {
  const DrugNames(
    this.ingredient,
    this.koreanName, {
    this.brands = const [],
    this.otherNames = const [],
  });

  final String ingredient;
  final String koreanName;
  final List<String> brands;
  final List<String> otherNames;

  Iterable<String> get terms =>
      [ingredient, koreanName, ...brands, ...otherNames];

  String get description => '$koreanName ($ingredient)';

  Match? matchName(String name) {
    for (final term in terms) {
      // Match complete leading names, not epinephrine inside norepinephrine.
      final match = RegExp(
        '^${RegExp.escape(term)}(?=\$|[^a-z가-힣])',
        caseSensitive: false,
      ).firstMatch(name.trim());
      if (match != null) return match;
    }
    return null;
  }
}

// Search synonyms only: each preset keeps its own concentration and dose units.
// Product-name sources and the intentionally limited scope are in docs/drug-search.md.
const drugNames = [
  DrugNames('dexmedetomidine', '덱스메데토미딘', brands: ['Precedex', '프리세덱스']),
  DrugNames('norepinephrine', '노르에피네프린',
      brands: ['Norpin', '노르핀'],
      otherNames: ['norphin', 'noradrenaline', '노르아드레날린']),
  DrugNames('remifentanil', '레미펜타닐', brands: ['Ultiva', '울티바']),
  DrugNames('propofol', '프로포폴', brands: ['Diprivan', '디프리반']),
  DrugNames('amiodarone', '아미오다론',
      brands: ['Cordarone', '코다론'], otherNames: ['cordaron']),
  DrugNames('labetalol', '라베탈롤',
      brands: ['Labesin', '라베신'], otherNames: ['라베타롤']),
  DrugNames('argatroban', '아가트로반',
      brands: ['Novastan', '노바스탄'], otherNames: ['아르가트로반']),
  DrugNames('alprostadil', '알프로스타딜',
      brands: ['Eglandin', '에글란딘'], otherNames: ['PGE1', 'lipo-PGE1']),
  DrugNames('dopamine', '도파민', brands: ['Dopamix', '도파믹스']),
  DrugNames('dobutamine', '도부타민'),
  DrugNames('dobutamix', '도부타믹스'),
  DrugNames('epinephrine', '에피네프린', otherNames: ['adrenaline', '아드레날린']),
  DrugNames('vasopressin', '바소프레신'),
  DrugNames('heparin', '헤파린'),
  DrugNames('pantoprazole', '판토프라졸'),
  DrugNames('nicardipine', '니카르디핀', otherNames: ['니카디핀']),
  DrugNames('nitroglycerin', '니트로글리세린'),
  DrugNames('lidocaine', '리도카인'),
  DrugNames('hydrocortisone', '히드로코르티손',
      otherNames: ['하이드로코르티손', 'cortisol', '코르티솔']),
  DrugNames('midazolam', '미다졸람'),
  DrugNames('esmolol', '에스몰롤'),
  DrugNames('diltiazem', '딜티아젬'),
  DrugNames('tirofiban', '티로피반'),
  DrugNames('phenylephrine', '페닐레프린'),
  DrugNames('fentanyl', '펜타닐'),
  DrugNames('sufentanil', '수펜타닐'),
  DrugNames('vecuronium', '베쿠로늄'),
  DrugNames('rocuronium', '로쿠로늄'),
  DrugNames('ketamine', '케타민'),
  DrugNames('morphine', '모르핀'),
  DrugNames('isoproterenol', '이소프로테레놀'),
  DrugNames('milrinone', '밀리논'),
  DrugNames('remimazolam', '레미마졸람'),
  DrugNames('magnesium sulfate', '황산마그네슘', otherNames: ['MgSO4']),
];

DrugNames? namesForDrug(String name) {
  for (final names in drugNames) {
    if (names.matchName(name) != null) return names;
  }
  return null;
}
