namespace IPRS.Server.Extensions;

public static class StringExtensions
{
    /// <summary>
    /// Safely parses a string into a Guid. 
    /// Throws an ArgumentException with a custom message if parsing fails.
    /// </summary>
    public static Guid ToGuid(this string? value, string errorMessage = "The provided identifier format is invalid.")
    {
        if (string.IsNullOrWhiteSpace(value) || !Guid.TryParse(value, out Guid result))
        {
            throw new ArgumentException(errorMessage);
        }

        return result;
    }
}