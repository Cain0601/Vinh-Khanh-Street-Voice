using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using FoodTour.Api.Services;
using FoodTour.Api.DTOs; // Added for ApiResponse

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

        public class UpdateProfileRequest
        {
            public string? FullName { get; set; }
            public string? Email { get; set; }
            public string? Language { get; set; }
            public bool? IsOnboarded { get; set; }
        }

        public class RegisterRequest
        {
            public string DisplayName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty; // password stored only for demo, not saved to Firestore
            public string? Language { get; set; }
        }

        private string GetFirebaseEmail() => HttpContext.Items["FirebaseEmail"]?.ToString() ?? string.Empty;

        private string GetFirebaseName() => HttpContext.Items["FirebaseName"]?.ToString() ?? string.Empty;

        private async Task<User> EnsureUserAsync(string email, string? fullName = null)
        {
            var existing = await _userRepo.GetByEmailAsync(email);
            if (existing != null)
            {
                var updates = new Dictionary<string, object>();

                if (string.IsNullOrWhiteSpace(existing.FullName) && !string.IsNullOrWhiteSpace(fullName))
                    updates["fullName"] = fullName.Trim();

                if (string.IsNullOrWhiteSpace(existing.Role))
                    updates["role"] = "USER";

                if (!existing.IsActive)
                    updates["isActive"] = true;

                if (updates.Count > 0)
                {
                    await _userRepo.UpdateFieldsAsync(existing.Id, updates);
                    existing = await _userRepo.GetByIdAsync(existing.Id) ?? existing;
                }

                return existing;
            }

            var user = new User
            {
                FullName = string.IsNullOrWhiteSpace(fullName) ? string.Empty : fullName.Trim(),
                Email = email.Trim(),
                Role = "USER",
                Language = "vi",
                IsOnboarded = false
            };

            return await _userRepo.AddAsync(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(ApiResponse.Fail("Email and password are required"));

            // Check if email already exists
            var existing = await _userRepo.GetByEmailAsync(request.Email);
            if (existing != null)
            {
                return Ok(ApiResponse.Ok(existing, "User already registered"));
            }

            var user = new User
            {
                // The User model uses FullName instead of DisplayName
                FullName = request.DisplayName,
                Email = request.Email,
                Role = "USER",
                Language = string.IsNullOrWhiteSpace(request.Language) ? "vi" : request.Language,
                IsOnboarded = false,
                // other fields left null – locationEnabled will be handled on onboarding
            };

            var created = await _userRepo.AddAsync(user);
            return Ok(ApiResponse.Ok(created, "User registered successfully"));
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var email = GetFirebaseEmail();
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(ApiResponse.Fail("Missing authenticated email"));

            var user = await EnsureUserAsync(email, GetFirebaseName());
            return Ok(ApiResponse.Ok(user));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var email = GetFirebaseEmail();
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(ApiResponse.Fail("Missing authenticated email"));

            var user = await EnsureUserAsync(email, GetFirebaseName());
            var updates = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(request.FullName))
                updates["fullName"] = request.FullName.Trim();

            if (!string.IsNullOrWhiteSpace(request.Email))
                updates["email"] = request.Email.Trim();

            if (!string.IsNullOrWhiteSpace(request.Language))
                updates["language"] = request.Language.Trim();

            if (request.IsOnboarded.HasValue)
                updates["isOnboarded"] = request.IsOnboarded.Value;

            if (updates.Count > 0)
            {
                await _userRepo.UpdateFieldsAsync(user.Id, updates);
            }

            var updated = await _userRepo.GetByIdAsync(user.Id) ?? user;
            return Ok(ApiResponse.Ok(updated, "Profile updated successfully"));
        }
    }
}
