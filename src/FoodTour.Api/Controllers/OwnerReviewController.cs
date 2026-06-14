using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using FoodTour.Api.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    public class OwnerReviewController : ControllerBase
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "reviews";

        public OwnerReviewController(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        /// <summary>
        /// GET /api/owner/pois/{poiId}/reviews
        /// Lấy toàn bộ danh sách đánh giá/bình luận của một quán ăn
        /// </summary>
        [HttpGet("pois/{poiId}/reviews")]
        public async Task<IActionResult> GetPoiReviews(string poiId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("poiId", poiId)
                .GetSnapshotAsync();

            var list = new List<Review>();
            double totalStars = 0;

            foreach (var doc in snapshot.Documents)
            {
                var review = doc.ConvertTo<Review>();
                review.Id = doc.Id;
                list.Add(review);
                totalStars += review.Rating; // Giả sử thuộc tính trong model tên là Rating hoặc Stars
            }

            // Tính trung bình cộng số sao của quán
            double averageRating = list.Count > 0 ? System.Math.Round(totalStars / list.Count, 1) : 0;

            return Ok(new { 
                success = true, 
                data = list, 
                total = list.Count,
                averageRating = averageRating,
                message = "Tải danh sách đánh giá thành công!" 
            });
        }
    }
}