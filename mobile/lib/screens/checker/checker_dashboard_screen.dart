import 'package:flutter/material.dart';
import '../../models/identity_request.dart';
import '../../services/checker_service.dart';
import '../../widgets/request_card.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/empty_state.dart';
import 'verify_request_screen.dart';

class CheckerDashboardScreen extends StatefulWidget {
  const CheckerDashboardScreen({super.key});

  @override
  State<CheckerDashboardScreen> createState() => _CheckerDashboardScreenState();
}

class _CheckerDashboardScreenState extends State<CheckerDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _checkerService = CheckerService();

  final List<String> _statuses = ['pending', 'verified', 'rejected'];
  final Map<String, List<IdentityRequest>> _requestsByStatus = {};
  final Map<String, bool> _loadingByStatus = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        _fetchForTab(_tabController.index);
      }
    });
    _fetchForTab(0);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchForTab(int index) async {
    final status = _statuses[index];
    if (_loadingByStatus[status] == true) return;
    setState(() => _loadingByStatus[status] = true);
    try {
      final data = await _checkerService.getRequests(status: status, limit: 50);
      setState(() {
        _requestsByStatus[status] = (data['requests'] as List).map((r) => IdentityRequest.fromJson(r)).toList();
      });
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loadingByStatus[status] = false);
    }
  }

  Widget _buildTab(String status) {
    final loading = _loadingByStatus[status] ?? true;
    final requests = _requestsByStatus[status] ?? [];

    if (loading) return const ShimmerLoading();
    if (requests.isEmpty) {
      return EmptyState(
        icon: Icons.inbox_outlined,
        title: 'No ${status} requests',
        description: status == 'pending' ? 'All caught up! No pending verifications.' : null,
      );
    }

    return RefreshIndicator(
      onRefresh: () => _fetchForTab(_statuses.indexOf(status)),
      child: ListView.builder(
        itemCount: requests.length,
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemBuilder: (_, i) => RequestCard(
          request: requests[i],
          onTap: () async {
            await Navigator.push(context, MaterialPageRoute(builder: (_) => VerifyRequestScreen(requestId: requests[i].id)));
            _fetchForTab(_tabController.index);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Verified'),
            Tab(text: 'Rejected'),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: _statuses.map((s) => _buildTab(s)).toList(),
          ),
        ),
      ],
    );
  }
}
