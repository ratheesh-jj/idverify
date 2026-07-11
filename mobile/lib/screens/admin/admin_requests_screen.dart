import 'package:flutter/material.dart';
import '../../models/identity_request.dart';
import '../../services/admin_service.dart';
import '../../widgets/request_card.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/empty_state.dart';
import '../checker/verify_request_screen.dart';

class AdminRequestsScreen extends StatefulWidget {
  const AdminRequestsScreen({super.key});

  @override
  State<AdminRequestsScreen> createState() => _AdminRequestsScreenState();
}

class _AdminRequestsScreenState extends State<AdminRequestsScreen> {
  final _adminService = AdminService();
  List<IdentityRequest> _requests = [];
  bool _loading = true;
  String? _statusFilter;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchRequests() async {
    setState(() => _loading = true);
    try {
      final data = await _adminService.getRequests(limit: 50, status: _statusFilter, search: _searchCtrl.text.trim());
      setState(() => _requests = (data['requests'] as List).map((r) => IdentityRequest.fromJson(r)).toList());
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  decoration: const InputDecoration(hintText: 'Search requests...', prefixIcon: Icon(Icons.search, size: 20), contentPadding: EdgeInsets.symmetric(vertical: 10)),
                  onSubmitted: (_) => _fetchRequests(),
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                icon: const Icon(Icons.filter_list_rounded),
                onSelected: (v) {
                  _statusFilter = v == 'all' ? null : v;
                  _fetchRequests();
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(value: 'all', child: Text('All')),
                  const PopupMenuItem(value: 'pending', child: Text('Pending')),
                  const PopupMenuItem(value: 'verified', child: Text('Verified')),
                  const PopupMenuItem(value: 'rejected', child: Text('Rejected')),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const ShimmerLoading()
              : _requests.isEmpty
                  ? const EmptyState(icon: Icons.inbox_outlined, title: 'No requests found')
                  : RefreshIndicator(
                      onRefresh: _fetchRequests,
                      child: ListView.builder(
                        itemCount: _requests.length,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        itemBuilder: (_, i) => RequestCard(
                          request: _requests[i],
                          onTap: () async {
                            await Navigator.push(context, MaterialPageRoute(builder: (_) => VerifyRequestScreen(requestId: _requests[i].id)));
                            _fetchRequests();
                          },
                        ),
                      ),
                    ),
        ),
      ],
    );
  }
}
