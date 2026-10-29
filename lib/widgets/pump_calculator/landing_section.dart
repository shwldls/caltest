import 'package:flutter/material.dart';

import '../../data/default_presets.dart' as preset_data;
import '../../models/drug_preset.dart';
import 'shared_widgets.dart';

class LandingSection extends StatelessWidget {
  const LandingSection({
    required this.onSelectDepartment,
    super.key,
  });

  final ValueChanged<String> onSelectDepartment;

  @override
  Widget build(BuildContext context) {
    return ThemedBoard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const CloudHeader(titleSize: 52),
          const SizedBox(height: 14),
          const _PickBanner(),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final useSingleColumn = constraints.maxWidth < 360;
              final textScale = MediaQuery.textScalerOf(context).scale(14) / 14;
              return GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: useSingleColumn ? 1 : 2,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 16,
                  mainAxisExtent: (useSingleColumn ? 100 : 158) * textScale,
                ),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: preset_data.defaultDepartments.length,
                itemBuilder: (context, index) {
                  final department = preset_data.defaultDepartments[index];
                  return DepartmentCard(
                    department: department,
                    useHorizontalLayout: useSingleColumn,
                    onTap: () => onSelectDepartment(department.id),
                  );
                },
              );
            },
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}

class DepartmentCard extends StatelessWidget {
  const DepartmentCard({
    required this.department,
    required this.useHorizontalLayout,
    required this.onTap,
    super.key,
  });

  final DepartmentPreset department;
  final bool useHorizontalLayout;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: SizedBox(
          width: double.infinity,
          height: double.infinity,
          child: ScallopedCard(
            padding: useHorizontalLayout
                ? const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
                : const EdgeInsets.fromLTRB(10, 18, 10, 14),
            child: useHorizontalLayout
                ? Row(
                    children: [
                      Text(
                        department.icon,
                        style: const TextStyle(fontSize: 27),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: _DepartmentCardText(
                          department: department,
                          textAlign: TextAlign.left,
                        ),
                      ),
                    ],
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        department.icon,
                        style: const TextStyle(fontSize: 25),
                      ),
                      const SizedBox(height: 5),
                      _DepartmentCardText(
                        department: department,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

class _DepartmentCardText extends StatelessWidget {
  const _DepartmentCardText({
    required this.department,
    required this.textAlign,
  });

  final DepartmentPreset department;
  final TextAlign textAlign;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: textAlign == TextAlign.left
          ? CrossAxisAlignment.start
          : CrossAxisAlignment.center,
      children: [
        Text(
          department.label,
          textAlign: textAlign,
          style: TextStyle(
            fontSize: 20,
            height: 1.25,
            fontWeight: FontWeight.w800,
            color: snoobiInk,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          department.description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          textAlign: textAlign,
          style: const TextStyle(
            fontSize: 13,
            height: 1.4,
            fontWeight: FontWeight.w500,
            color: Color(0xFF52606D),
          ),
        ),
      ],
    );
  }
}

class _PickBanner extends StatelessWidget {
  const _PickBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
      decoration: BoxDecoration(
        color: snoobiCream,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: snoobiInk, width: 1.5),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Flexible(
            child: Text.rich(
              TextSpan(text: '계산할 부서를 선택해 주세요'),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 17,
                height: 1.4,
                fontWeight: FontWeight.w700,
                color: snoobiInk,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
