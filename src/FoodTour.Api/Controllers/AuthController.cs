using FoodTour.Api.DTOs;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepo;

        public AuthController(UserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var user = HttpContext.Items["UserData"] as User;
            if (user == null)
                return NotFound(ApiResponse.Fail("User profile not found"));

            return Ok(ApiResponse.Ok(user));
        }

        [HttpPut("profile")]
        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(ApiResponse.Fail("User is not authenticated"));

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(ApiResponse.Fail("User profile not found"));

            var updates = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(request.DisplayName))
            {
                updates["fullName"] = request.DisplayName.Trim();
                user.FullName = request.DisplayName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                updates["fullName"] = request.FullName.Trim();
                user.FullName = request.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Language))
            {
                updates["language"] = request.Language.Trim();
                user.Language = request.Language.Trim();
            }

            if (updates.Count == 0)
                return BadRequest(ApiResponse.Fail("No profile fields were provided"));

            await _userRepo.UpdateFieldsAsync(userId, updates);
            return Ok(ApiResponse.Ok(user, "Profile updated"));
        }
    }

    public class UpdateProfileRequest
    {
        public string? DisplayName { get; set; }
        public string? FullName { get; set; }
        public string? Language { get; set; }
    }
}
