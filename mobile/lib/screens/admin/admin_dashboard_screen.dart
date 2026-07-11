import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/audit_log.dart';
import '../../services/admin_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/loading_indicator.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final _adminService = AdminService();
  bool _loading = true;
  Map<String, dynamic> _stats = {};
  List<AuditLog> _activity = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final data = await _adminService.getDashboard();
      setState(() {
        _stats = data['stats'] ?? {};
        _activity = (data['recentActivity'] as List?)?.map((a) => AuditLog.fromJson(a)).toList() ?? [];
      });
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _actionColor(String action) {
    if (action.contains('APPROVED') || action.contains('CREATED')) return AppColors.success;
    if (action.contains('REJECTED') || action.contains('DELETED')) return AppColors.danger;
    if (action.contains('ROLE') || action.contains('UPDATED')) return AppColors.secondary;
    return AppColors.textSecondary;
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingIndicator(message: 'Loading dashboard...');

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Admin Dashboard', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('System overview and analytics', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5), fontSize: 14)),
          const SizedBox(height: 20),

          // Stats
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.4,
            children: [
              StatCard(label: 'TOTAL USERS', value: '${_stats['totalUsers'] ?? 0}', icon: Icons.people_outline, color: AppColors.primary),
              StatCard(label: 'MAKERS', value: '${_stats['totalMakers'] ?? 0}', icon: Icons.person_outline, color: AppColors.secondary),
              StatCard(label: 'CHECKERS', value: '${_stats['totalCheckers'] ?? 0}', icon: Icons.verified_user_outlined, color: const Color(0xFF6366F1)),
              StatCard(label: 'REQUESTS', value: '${_stats['totalRequests'] ?? 0}', icon: Icons.description_outlined, color: const Color(0xFF8B5CF6)),
              StatCard(label: 'PENDING', value: '${_stats['pendingRequests'] ?? 0}', icon: Icons.schedule_rounded, color: AppColors.warning),
              StatCard(label: 'VERIFIED', value: '${_stats['verifiedRequests'] ?? 0}', icon: Icons.check_circle_outline, color: AppColors.success),
              StatCard(label: 'REJECTED', value: '${_stats['rejectedRequests'] ?? 0}', icon: Icons.cancel_outlined, color: AppColors.danger),
              StatCard(label: 'ADMINS', value: '${_stats['totalAdmins'] ?? 0}', icon: Icons.admin_panel_settings_outlined, color: const Color(0xFFF43F5E)),
            ],
          ),
          const SizedBox(height: 20),

          // Recent Activity
          Text('Recent Activity', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Card(
            child: _activity.isEmpty
                ? const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No recent activity')))
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _activity.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      final log = _activity[i];
                      return ListTile(
                        dense: true,
                        title: Text(log.actionDisplay, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: _actionColor(log.action))),
                        subtitle: Text(
                          'by ${log.performedByName ?? "System"}${log.details['applicantName'] != null ? ' • ${log.details['applicantName']}' : ''}${log.details['userName'] != null ? ' • ${log.details['userName']}' : ''}',
                          style: const TextStyle(fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Text(DateFormat('dd/MM HH:mm').format(log.createdAt), style: const TextStyle(fontSize: 11)),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
