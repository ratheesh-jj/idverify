import 'package:flutter/material.dart';
import '../../models/identity_request.dart';
import '../../services/identity_service.dart';
import '../../widgets/request_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/shimmer_loading.dart';
import 'request_detail_screen.dart';

class MyRequestsScreen extends StatefulWidget {
  const MyRequestsScreen({super.key});

  @override
  State<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends State<MyRequestsScreen> {
  final _identityService = IdentityService();
  final _searchCtrl = TextEditingController();

  List<IdentityRequest> _requests = [];
  bool _loading = true;
  int _page = 1;
  int _totalPages = 1;
  String? _statusFilter;
  String _sort = 'newest';

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
      final data = await _identityService.getMyRequests(
        page: _page,
        status: _statusFilter,
        search: _searchCtrl.text.trim(),
        sort: _sort,
      );
      setState(() {
        _requests = (data['requests'] as List).map((r) => IdentityRequest.fromJson(r)).toList();
        _totalPages = data['pagination']['pages'] ?? 1;
      });
    } catch (e) {
      debugPrint('Error fetching requests: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search & Filters
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Search by name...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              _page = 1;
                              _fetchRequests();
                            },
                          )
                        : null,
                  ),
                  onSubmitted: (_) {
                    _page = 1;
                    _fetchRequests();
                  },
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                icon: const Icon(Icons.filter_list_rounded),
                tooltip: 'Filter by status',
                onSelected: (v) {
                  _statusFilter = v == 'all' ? null : v;
                  _page = 1;
                  _fetchRequests();
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(value: 'all', child: Text('All')),
                  const PopupMenuItem(value: 'pending', child: Text('Pending')),
                  const PopupMenuItem(value: 'verified', child: Text('Verified')),
                  const PopupMenuItem(value: 'rejected', child: Text('Rejected')),
                ],
              ),
              IconButton(
                icon: Icon(_sort == 'newest' ? Icons.arrow_downward : Icons.arrow_upward, size: 20),
                tooltip: 'Sort',
                onPressed: () {
                  _sort = _sort == 'newest' ? 'oldest' : 'newest';
                  _page = 1;
                  _fetchRequests();
                },
              ),
            ],
          ),
        ),

        // List
        Expanded(
          child: _loading
              ? const ShimmerLoading()
              : _requests.isEmpty
                  ? const EmptyState(icon: Icons.inbox_outlined, title: 'No requests found')
                  : RefreshIndicator(
                      onRefresh: _fetchRequests,
                      child: ListView.builder(
                        itemCount: _requests.length + 1,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        itemBuilder: (_, i) {
                          if (i == _requests.length) {
                            // Pagination controls
                            if (_totalPages <= 1) return const SizedBox.shrink();
                            return Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    onPressed: _page > 1
                                        ? () {
                                            _page--;
                                            _fetchRequests();
                                          }
                                        : null,
                                    icon: const Icon(Icons.chevron_left),
                                  ),
                                  Text('Page $_page of $_totalPages', style: const TextStyle(fontWeight: FontWeight.w600)),
                                  IconButton(
                                    onPressed: _page < _totalPages
                                        ? () {
                                            _page++;
                                            _fetchRequests();
                                          }
                                        : null,
                                    icon: const Icon(Icons.chevron_right),
                                  ),
                                ],
                              ),
                            );
                          }
                          return RequestCard(
                            request: _requests[i],
                            onTap: () async {
                              await Navigator.push(context, MaterialPageRoute(builder: (_) => RequestDetailScreen(requestId: _requests[i].id)));
                              _fetchRequests();
                            },
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}
