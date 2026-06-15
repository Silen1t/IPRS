using IPRS.Server.Common;

namespace IPRS.Server.Helpers;

public static class EnumHelper
{
    public static ServiceResult<T> ConvertStringToEnum<T>(string enumString, string errorMessage, bool useResultError = false)
        where T : struct, Enum
    {
        if (!Enum.TryParse<T>(enumString, true, out var result))
            return ServiceResult<T>.LogFailure($"{errorMessage}{(useResultError ? $": {result}" : "")}");

        return ServiceResult<T>.LogSuccess(result);
    }
}