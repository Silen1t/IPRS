using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
public class GlobalController : BaseApiController
{
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult GetHealth() => Ok(new { status = "Healthy" });
}