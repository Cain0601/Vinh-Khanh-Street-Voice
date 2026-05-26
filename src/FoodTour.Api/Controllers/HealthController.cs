using Microsoft.AspNetCore.Mvc;
using System;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok(new { status = "ok", time = DateTime.UtcNow });
    }
}
