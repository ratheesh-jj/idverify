import 'package:flutter/material.dart';
import '../../models/identity_request.dart';
import '../../services/identity_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/request_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/empty_state.dart';
import 'request_detail_screen.dart';
import 'new_request_screen.dart';

class MakerDashboardScreen extends StatefulWidget {
  const MakerDashboardScreen({super.key});

  @override
  State<MakerDashboardScreen> createState() => _MakerDashboardScreenState();
}

class _MakerDashboardScreenState extends State<MakerDashboardScreen> {
  final _identityService = IdentityService();
  bool _loading = true;
  int _total = 0, _pending = 0, _verified = 0, _rejected = 0;
  List<IdentityRequest> _recentRequests = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _identityService.getMyRequests(limit: 5),
        _identityService.getMyRequests(status: 'pending', limit: 1),
        _identityService.getMyRequests(status: 'verified', limit: 1),
        _identityService.getMyRequests(status: 'rejected', limit: 1),
      ]);

      setState(() {
        _recentRequests = (results[0]['requests'] as List)
            .map((r) => IdentityRequest.fromJson(r))
            .toList();
        _total = results[0]['pagination']['total'] ?? 0;
        _pending = results[1]['pagination']['total'] ?? 0;
        _verified = results[2]['pagination']['total'] ?? 0;
        _rejected = results[3]['pagination']['total'] ?? 0;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load dashboard: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingIndicator(message: 'Loading dashboard...');

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Dashboard', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text('Submit and track your requests', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5), fontSize: 14)),
                ],
              ),
              FilledButton.icon(
                onPressed: () async {
                  await Navigator.push(context, MaterialPageRoute(builder: (_) => const NewRequestScreen()));
                  _fetchData();
                },
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text('New'),
              ),
            ],
          ),
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
              StatCard(label: 'TOTAL', value: '$_total', icon: Icons.description_outlined, color: AppColors.primary),
              StatCard(label: 'PENDING', value: '$_pending', icon: Icons.schedule_rounded, color: AppColors.warning),
              StatCard(label: 'VERIFIED', value: '$_verified', icon: Icons.check_circle_outline, color: AppColors.success),
              StatCard(label: 'REJECTED', value: '$_rejected', icon: Icons.cancel_outlined, color: AppColors.danger),
            ],
          ),
          const SizedBox(height: 20),

          // Recent Requests
          Text('Recent Requests', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          if (_recentRequests.isEmpty)
            const EmptyState(icon: Icons.description_outlined, title: 'No requests yet', description: 'Submit your first identity verification request.')
          else
            ..._recentRequests.map((r) => RequestCard(
              request: r,
              onTap: () async {
                await Navigator.push(context, MaterialPageRoute(builder: (_) => RequestDetailScreen(requestId: r.id)));
                _fetchData();
              },
            )),
        ],
      ),
    );
  }
}
