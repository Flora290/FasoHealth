import 'package:flutter/material.dart';
import '../core/constants.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? color;
  final double? borderRadius;
  final List<BoxShadow>? boxShadow;
  final Border? border;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.color,
    this.borderRadius,
    this.boxShadow,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(AppDesign.cardPadding),
      decoration: BoxDecoration(
        color: color ?? AppDesign.white,
        borderRadius: BorderRadius.circular(borderRadius ?? AppDesign.borderRadius),
        boxShadow: boxShadow ?? AppDesign.softShadow,
        border: border,
      ),
      child: child,
    );
  }
}
