import 'package:flutter/material.dart';
import '../../models/user.dart';
import '../../services/admin_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/validators.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/empty_state.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  final _adminService = AdminService();
  final _searchCtrl = TextEditingController();
  List<User> _users = [];
  bool _loading = true;
  String? _roleFilter;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchUsers() async {
    setState(() => _loading = true);
    try {
      final data = await _adminService.getUsers(limit: 100, role: _roleFilter, search: _searchCtrl.text.trim());
      setState(() => _users = (data['users'] as List).map((u) => User.fromJson(u)).toList());
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showCreateUserDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    String role = 'maker';
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Create User'),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(controller: nameCtrl, validator: Validators.name, decoration: const InputDecoration(labelText: 'Name')),
                  const SizedBox(height: 12),
                  TextFormField(controller: emailCtrl, validator: Validators.email, decoration: const InputDecoration(labelText: 'Email')),
                  const SizedBox(height: 12),
                  TextFormField(controller: passwordCtrl, validator: Validators.password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: role,
                    decoration: const InputDecoration(labelText: 'Role'),
                    items: const [
                      DropdownMenuItem(value: 'maker', child: Text('Maker')),
                      DropdownMenuItem(value: 'checker', child: Text('Checker')),
                      DropdownMenuItem(value: 'admin', child: Text('Admin')),
                    ],
                    onChanged: (v) => setDialogState(() => role = v ?? 'maker'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            FilledButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                try {
                  await _adminService.createUser(
                    name: nameCtrl.text.trim(),
                    email: emailCtrl.text.trim(),
                    password: passwordCtrl.text,
                    role: role,
                  );
                  if (mounted) Navigator.pop(ctx);
                  _fetchUsers();
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User created successfully')));
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.danger));
                }
              },
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditUserDialog(User user) {
    final nameCtrl = TextEditingController(text: user.name);
    final emailCtrl = TextEditingController(text: user.email);
    final passwordCtrl = TextEditingController();
    String role = user.role;
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Edit User'),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(controller: nameCtrl, validator: Validators.name, decoration: const InputDecoration(labelText: 'Name')),
                  const SizedBox(height: 12),
                  TextFormField(controller: emailCtrl, validator: Validators.email, decoration: const InputDecoration(labelText: 'Email')),
                  const SizedBox(height: 12),
                  TextFormField(controller: passwordCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'New Password (leave empty to keep)')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: role,
                    decoration: const InputDecoration(labelText: 'Role'),
                    items: const [
                      DropdownMenuItem(value: 'maker', child: Text('Maker')),
                      DropdownMenuItem(value: 'checker', child: Text('Checker')),
                      DropdownMenuItem(value: 'admin', child: Text('Admin')),
                    ],
                    onChanged: (v) => setDialogState(() => role = v ?? 'maker'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            FilledButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                try {
                  await _adminService.updateUser(
                    user.id,
                    name: nameCtrl.text.trim(),
                    email: emailCtrl.text.trim(),
                    role: role,
                    password: passwordCtrl.text.isNotEmpty ? passwordCtrl.text : null,
                  );
                  if (mounted) Navigator.pop(ctx);
                  _fetchUsers();
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User updated successfully')));
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.danger));
                }
              },
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteUser(User user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete User'),
        content: Text('Are you sure you want to delete ${user.name}? This will also delete their requests.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _adminService.deleteUser(user.id);
        _fetchUsers();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User deleted')));
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.danger));
      }
    }
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'admin':
        return const Color(0xFF8B5CF6);
      case 'checker':
        return AppColors.success;
      default:
        return AppColors.secondary;
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
                  decoration: const InputDecoration(hintText: 'Search users...', prefixIcon: Icon(Icons.search, size: 20), contentPadding: EdgeInsets.symmetric(vertical: 10)),
                  onSubmitted: (_) => _fetchUsers(),
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                icon: const Icon(Icons.filter_list_rounded),
                onSelected: (v) {
                  _roleFilter = v == 'all' ? null : v;
                  _fetchUsers();
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(value: 'all', child: Text('All Roles')),
                  const PopupMenuItem(value: 'maker', child: Text('Makers')),
                  const PopupMenuItem(value: 'checker', child: Text('Checkers')),
                  const PopupMenuItem(value: 'admin', child: Text('Admins')),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.person_add_rounded),
                tooltip: 'Create User',
                onPressed: _showCreateUserDialog,
              ),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const LoadingIndicator()
              : _users.isEmpty
                  ? const EmptyState(icon: Icons.people_outline, title: 'No users found')
                  : RefreshIndicator(
                      onRefresh: _fetchUsers,
                      child: ListView.builder(
                        itemCount: _users.length,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        itemBuilder: (_, i) {
                          final user = _users[i];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: _roleColor(user.role),
                                child: Text(user.name.isNotEmpty ? user.name[0].toUpperCase() : '?', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                              ),
                              title: Text(user.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text(user.email, style: const TextStyle(fontSize: 12)),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: _roleColor(user.role).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                    child: Text(user.roleDisplay, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _roleColor(user.role))),
                                  ),
                                  PopupMenuButton<String>(
                                    icon: const Icon(Icons.more_vert, size: 18),
                                    onSelected: (action) {
                                      if (action == 'edit') _showEditUserDialog(user);
                                      if (action == 'delete') _deleteUser(user);
                                    },
                                    itemBuilder: (_) => [
                                      const PopupMenuItem(value: 'edit', child: Text('Edit')),
                                      const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.danger))),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}
