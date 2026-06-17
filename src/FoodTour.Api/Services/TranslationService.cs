using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;

namespace FoodTour.Api.Services
{
    public class TranslationService
    {
        private readonly HttpClient _httpClient;

        public TranslationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> TranslateAsync(string text, string targetLanguage, string sourceLanguage = "auto")
        {
            if (string.IsNullOrWhiteSpace(text)) return text;

            // -------------------------------------------------
            // Map short language codes used by the API to the
            // full ISO codes expected by Google Translate.
            // -------------------------------------------------
            string mappedLang = targetLanguage.ToLower() switch
            {
                "cn" => "zh-CN",
                "zh" => "zh-CN",
                "zh-cn" => "zh-CN",
                "en" => "en",
                "vi" => "vi",
                "vn" => "vi",
                "ja" => "ja",
                "jp" => "ja",
                "fr" => "fr",
                "es" => "es",
                _ => targetLanguage // fallback to whatever was passed
            };

            Console.WriteLine($"[TranslationService] Mapping targetLanguage '{targetLanguage}' -> '{mappedLang}'");

            var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sourceLanguage}&tl={mappedLang}&dt=t&q={HttpUtility.UrlEncode(text)}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            
            // The response format is roughly: [[["translated text", "original text", null, null, 1]], null, "vi"]
            Console.WriteLine($"[TranslationService] Raw translation response: {json}");
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;

            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
            {
                var firstArray = root[0];
                if (firstArray.ValueKind == JsonValueKind.Array && firstArray.GetArrayLength() > 0)
                {
                    var textArray = firstArray[0];
                    if (textArray.ValueKind == JsonValueKind.Array && textArray.GetArrayLength() > 0)
                    {
                        var translatedText = textArray[0].GetString();
                        if (!string.IsNullOrEmpty(translatedText))
                        {
                            return translatedText;
                        }
                    }
                }
            }

            return text;
        }
    }
}
