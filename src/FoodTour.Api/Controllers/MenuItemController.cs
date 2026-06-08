using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using FoodTour.Api.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    public class MenuItemController : ControllerBase
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "menuItems";

        public MenuItemController(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        /// <summary>
        /// GET /api/owner/pois/{poiId}/menu-items
        /// Lấy danh sách món ăn của một quán cụ thể
        /// </summary>
        [HttpGet("pois/{poiId}/menu-items")]
        public async Task<IActionResult> GetMenuItems(string poiId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("poiId", poiId)
                .GetSnapshotAsync();

            var list = new List<MenuItem>();
            foreach (var doc in snapshot.Documents)
            {
                var item = doc.ConvertTo<MenuItem>();
                item.Id = doc.Id;
                list.Add(item);
            }

            return Ok(new { success = true, data = list, total = list.Count });
        }

        /// <summary>
        /// POST /api/owner/pois/{poiId}/menu-items
        /// Thêm một món ăn mới vào thực đơn của quán
        /// </summary>
        [HttpPost("pois/{poiId}/menu-items")]
        public async Task<IActionResult> CreateMenuItem(string poiId, [FromBody] MenuItem item)
        {
            item.PoiId = poiId; // Gắn đúng mã quán cho món ăn
            
            var docRef = _db.Collection(CollectionName).Document();
            await docRef.SetAsync(item);
            item.Id = docRef.Id;

            return Ok(new { success = true, data = item, message = "Thêm món ăn vào thực đơn thành công!" });
        }

        /// <summary>
        /// PUT /api/owner/menu-items/{id}
        /// Cập nhật thông tin món ăn (Tên, giá, mô tả...)
        /// </summary>
        [HttpPut("menu-items/{id}")]
        public async Task<IActionResult> UpdateMenuItem(string id, [FromBody] MenuItem item)
        {
            await _db.Collection(CollectionName).Document(id).SetAsync(item, SetOptions.Overwrite);
            item.Id = id;

            return Ok(new { success = true, data = item, message = "Cập nhật món ăn thành công!" });
        }

        /// <summary>
        /// DELETE /api/owner/menu-items/{id}
        /// Xóa món ăn khỏi thực đơn
        /// </summary>
        [HttpDelete("menu-items/{id}")]
        public async Task<IActionResult> DeleteMenuItem(string id)
        {
            await _db.Collection(CollectionName).Document(id).DeleteAsync();
            return Ok(new { success = true, message = "Xóa món ăn thành công!" });
        }
    }
}