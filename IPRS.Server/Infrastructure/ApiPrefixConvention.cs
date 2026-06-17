using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Routing;

namespace IPRS.Server.Infrastructure;

public class ApiPrefixConvention : IApplicationModelConvention
{
    private readonly AttributeRouteModel _routePrefix;

    public ApiPrefixConvention(string prefix)
    {
        _routePrefix = new AttributeRouteModel
        {
            Template = prefix
        };
    }

    public void Apply(ApplicationModel application)
    {
        foreach (var controller in application.Controllers)
        {
            foreach (var selector in controller.Selectors)
            {
                if (selector.AttributeRouteModel != null)
                {
                    // Combine the global prefix with the existing controller route
                    selector.AttributeRouteModel =
                        AttributeRouteModel.CombineAttributeRouteModel(_routePrefix, selector.AttributeRouteModel);
                }
                else
                {
                    // Fallback if the controller doesn't have a route attribute at all
                    selector.AttributeRouteModel = _routePrefix;
                }
            }
        }
    }
}