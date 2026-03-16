import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';
import 'constants.dart';

class ApiService {
  static final StorageService _storage = StorageService();

  static Future<Map<String, String>> _getHeaders({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await _storage.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  // ---- GET ----
  static Future<dynamic> get(String path) async {
    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}$path'),
      headers: await _getHeaders(),
    );
    return _handleResponse(res);
  }

  // ---- POST ----
  static Future<dynamic> post(String path, Map<String, dynamic> body, {bool auth = true}) async {
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}$path'),
      headers: await _getHeaders(auth: auth),
      body: jsonEncode(body),
    );
    return _handleResponse(res);
  }

  // ---- PUT ----
  static Future<dynamic> put(String path, Map<String, dynamic> body) async {
    final res = await http.put(
      Uri.parse('${AppConstants.baseUrl}$path'),
      headers: await _getHeaders(),
      body: jsonEncode(body),
    );
    return _handleResponse(res);
  }

  // ---- DELETE ----
  static Future<dynamic> delete(String path) async {
    final res = await http.delete(
      Uri.parse('${AppConstants.baseUrl}$path'),
      headers: await _getHeaders(),
    );
    return _handleResponse(res);
  }

  // ---- MULTIPART ----
  static Future<dynamic> multipart(String path, String filePath, {String fileField = 'image'}) async {
    final uri = Uri.parse('${AppConstants.baseUrl}$path');
    final req = http.MultipartRequest('POST', uri);
    final h = await _getHeaders();
    h.remove('Content-Type');
    req.headers.addAll(h);

    req.files.add(await http.MultipartFile.fromPath(fileField, filePath));

    final streamedResponse = await req.send();
    final res = await http.Response.fromStream(streamedResponse);
    return _handleResponse(res);
  }

  static dynamic _handleResponse(http.Response res) {
    final body = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body;
    } else {
      final msg = body['message'] ?? 'Erreur ${res.statusCode}';
      throw Exception(msg);
    }
  }
}
