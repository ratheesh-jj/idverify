import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';

// Maker screens
import 'maker/maker_dashboard_screen.dart';
import 'maker/my_requests_screen.dart';
import 'maker/new_request_screen.dart';

// Checker screens
import 'checker/checker_dashboard_screen.dart';

// Admin screens
import 'admin/admin_dashboard_screen.dart';
import 'admin/user_management_screen.dart';
import 'admin/admin_requests_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    if (user == null) return const SizedBox.shrink();

    final role = user.role;
    final pages = _getPages(role);
    final navItems = _getNavItems(role);

    return Scaffold(
      appBar: AppBar(
        title: Text(_getTitle(role, _currentIndex)),
        actions: [
          // Theme toggle
          IconButton(
            icon: Icon(
              context.watch<ThemeProvider>().isDarkMode
                  ? Icons.light_mode_outlined
                  : Icons.dark_mode_outlined,
            ),
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
            tooltip: 'Toggle theme',
          ),
          // Logout
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () => _confirmLogout(context),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: navItems.length > 1
          ? BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (i) => setState(() => _currentIndex = i),
              items: navItems,
            )
          : null,
      floatingActionButton: role == 'maker' || role == 'admin'
          ? FloatingActionButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NewRequestScreen()),
              ),
              child: const Icon(Icons.add_rounded),
            )
          : null,
    );
  }

  List<Widget> _getPages(String role) {
    switch (role) {
      case 'maker':
        return const [MakerDashboardScreen(), MyRequestsScreen()];
      case 'checker':
        return const [CheckerDashboardScreen()];
      case 'admin':
        return const [AdminDashboardScreen(), UserManagementScreen(), AdminRequestsScreen()];
      default:
        return const [MakerDashboardScreen()];
    }
  }

  List<BottomNavigationBarItem> _getNavItems(String role) {
    switch (role) {
      case 'maker':
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt_outlined), activeIcon: Icon(Icons.list_alt), label: 'Requests'),
        ];
      case 'checker':
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.verified_user_outlined), activeIcon: Icon(Icons.verified_user), label: 'Verify'),
        ];
      case 'admin':
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Users'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt_outlined), activeIcon: Icon(Icons.list_alt), label: 'Requests'),
        ];
      default:
        return const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
        ];
    }
  }

  String _getTitle(String role, int index) {
    switch (role) {
      case 'maker':
        return ['Dashboard', 'My Requests'][index];
      case 'checker':
        return 'Verification Queue';
      case 'admin':
        return ['Dashboard', 'Users', 'Requests'][index];
      default:
        return 'IDVerify';
    }
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}
