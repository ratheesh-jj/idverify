import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Displays a colored status badge (pending/verified/rejected)
class StatusBadge extends StatelessWidget {
  final String status;
  final double fontSize;

  const StatusBadge({super.key, required this.status, this.fontSize = 12});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    Color dotColor;

    switch (status.toLowerCase()) {
      case 'verified':
        bgColor = AppColors.success.withValues(alpha: 0.1);
        textColor = AppColors.success;
        dotColor = AppColors.success;
        break;
      case 'rejected':
        bgColor = AppColors.danger.withValues(alpha: 0.1);
        textColor = AppColors.danger;
        dotColor = AppColors.danger;
        break;
      default: // pending
        bgColor = AppColors.warning.withValues(alpha: 0.1);
        textColor = AppColors.warning;
        dotColor = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: dotColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            status[0].toUpperCase() + status.substring(1),
            style: TextStyle(
              color: textColor,
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
