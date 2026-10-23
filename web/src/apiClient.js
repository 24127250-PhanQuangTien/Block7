// Nơi duy nhất định nghĩa URL gốc của API (Slide 29, 50)
export const API_BASE_URL = "http://localhost:3000/api";

/**
 * Hàm gọi API tổng quát bóc tách chính xác 3 tầng lỗi theo tiêu chuẩn bài giảng
 * @param {string} endpoint - Ví dụ: '/dishes', '/dishes/2'
 * @param {object} options - Cấu hình fetch (method, headers, body...)
 * @returns {Promise<any>} data trả về khi ok: true
 */
export async function apiRequest(endpoint, options = {}) {
  let response;

  // --- TẦNG 1: Kiểm tra lỗi mạng hoặc bị CORS chặn ---
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch (networkError) {
    throw {
      type: "NETWORK_ERROR",
      isTechnical: true,
      message: "Không thể kết nối. Vui lòng kiểm tra lại đường truyền mạng hoặc thử lại sau.",
    };
  }

  // --- TẦNG 2: Kiểm tra lỗi kỹ thuật HTTP Status (404 sai URL, 500 lỗi máy chủ) ---
  if (!response.ok) {
    let errMessage = "Đã xảy ra sự cố. Vui lòng thử lại sau.";
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) errMessage = errBody.message;
    } catch (_) {}

    throw {
      type: "HTTP_ERROR",
      isTechnical: true,
      status: response.status,
      message: errMessage,
    };
  }

  // Đọc dữ liệu JSON
  let payload;
  try {
    payload = await response.json();
  } catch (jsonErr) {
    throw {
      type: "PARSE_ERROR",
      isTechnical: true,
      message: "Không thể xử lý dữ liệu. Vui lòng thử lại sau.",
    };
  }

  // --- TẦNG 3: Kiểm tra lỗi nghiệp vụ (ok: false) ---
  if (!payload.ok) {
    throw {
      type: "BUSINESS_ERROR",
      isTechnical: false,
      code: payload.error?.code || "UNKNOWN_BUSINESS_ERROR",
      message: payload.error?.message || "Đã xảy ra lỗi nghiệp vụ.",
      fields: payload.error?.fields || {},
    };
  }

  // Thành công hoàn toàn -> trả về dữ liệu nghiệp vụ sạch
  return payload.data;
}

// ==================== CÁC HÀM TIỆN ÍCH CHO MÓN ĂN ====================
export const dishApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    if (params.status) query.set("status", params.status);
    if (params.sort) query.set("sort", params.sort);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/dishes${qs}`);
  },
  getById: (id) => apiRequest(`/dishes/${id}`),
  create: (data) =>
    apiRequest("/dishes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/dishes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/dishes/${id}`, {
      method: "DELETE",
    }),
};

// ==================== CÁC HÀM TIỆN ÍCH CHO ĐẦU BẾP ====================
export const chefApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/chefs${qs}`);
  },
  getById: (id) => apiRequest(`/chefs/${id}`),
  create: (data) =>
    apiRequest("/chefs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/chefs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/chefs/${id}`, {
      method: "DELETE",
    }),
};

// ==================== CÁC HÀM TIỆN ÍCH CHO NGUYÊN LIỆU ====================
export const ingredientApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/ingredients${qs}`);
  },
  getById: (id) => apiRequest(`/ingredients/${id}`),
  create: (data) =>
    apiRequest("/ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/ingredients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/ingredients/${id}`, {
      method: "DELETE",
    }),
};
