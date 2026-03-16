import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/api_service.dart';
import '../core/storage_service.dart';
import '../models/user_model.dart';
import '../services/locale_service.dart';

class AuthProvider extends ChangeNotifier {
  final StorageService _storage = StorageService();

  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Initialize from persisted storage
  Future<void> init() async {
    // S'assurer que la locale est initialisée
    if (!LocaleService.isInitialized) {
      await LocaleService.initialize();
    }
    
    final loggedIn = await _storage.isLoggedIn();
    if (loggedIn) {
      try {
        final id = await _storage.getUserId();
        final name = await _storage.getUserName();
        final role = await _storage.getUserRole();
        
        if (id != null && name != null && role != null) {
          _user = UserModel(
            id: id,
            name: name,
            email: '',
            role: role,
          );
          notifyListeners();
        }

        final data = await ApiService.get('/auth/profile');
        _user = UserModel.fromJson(data);
        notifyListeners();
      } catch (e) {
        if (e.toString().contains('401') || e.toString().contains('403')) {
          await _storage.clearAll();
          _user = null;
          notifyListeners();
        }
      }
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post(
        '/auth/login',
        {'email': email, 'password': password},
        auth: false,
      );
      
      if (data['otpRequired'] == true) {
        _isLoading = false;
        notifyListeners();
        return data;
      }

      await _storage.saveAuthData(
        data['token'],
        data['name'],
        data['role'],
        data['_id'],
      );
      _user = UserModel.fromJson(data);
      _isLoading = false;
      notifyListeners();
      return {'success': true, ...data};
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': _error};
    }
  }

  Future<bool> verifyOTP(String email, String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post('/auth/verify-otp', {
        'email': email,
        'otp': otp,
      }, auth: false);

      if (data['token'] != null) {
        await _storage.saveAuthData(
          data['token'],
          data['name'],
          data['role'],
          data['_id'],
        );
        _user = UserModel.fromJson(data);
      } else if (data['isVerified'] == true) {
        // Verification success but no token (pending approval for doctors)
        _isLoading = false;
        notifyListeners();
        return true; 
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, String role, {String? phoneNumber}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final body = {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (phoneNumber != null && phoneNumber.isNotEmpty) 'phoneNumber': phoneNumber,
      };
      final data = await ApiService.post('/auth/register', body, auth: false);
      
      if (data['otpRequired'] == true) {
        _isLoading = false;
        notifyListeners();
        return data;
      }

      await _storage.saveAuthData(
        data['token'],
        data['name'],
        data['role'],
        data['_id'],
      );
      _user = UserModel.fromJson(data);
      _isLoading = false;
      notifyListeners();
      return {'success': true, ...data};
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': _error};
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post('/auth/forgot-password', {'email': email}, auth: false);
      _isLoading = false;
      notifyListeners();
      return {'success': true, 'message': data['message']};
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': _error};
    }
  }

  Future<Map<String, dynamic>> resetPassword(String email, String otp, String newPassword) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post('/auth/reset-password', {
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      }, auth: false);
      _isLoading = false;
      notifyListeners();
      return {'success': true, 'message': data['message']};
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': _error};
    }
  }

  Future<void> logout() async {
    await _storage.clearAll();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
