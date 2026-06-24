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
        _ => targetLanguage
    };

    Console.WriteLine($"[TranslationService] Mapping targetLanguage '{targetLanguage}' -> '{mappedLang}'");

    var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sourceLanguage}&tl={mappedLang}&dt=t&q={HttpUtility.UrlEncode(text)}";
    
    var response = await _httpClient.GetAsync(url);
    response.EnsureSuccessStatusCode();

    var json = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"[TranslationService] Raw translation response: {json}");

    using var document = JsonDocument.Parse(json);
    var root = document.RootElement;

    if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() == 0)
        return text;

    // root[0] chứa mảng các câu đã dịch
    var sentencesArray = root[0];
    if (sentencesArray.ValueKind != JsonValueKind.Array)
        return text;

    var translatedParts = new List<string>();

    foreach (var sentence in sentencesArray.EnumerateArray())
    {
        if (sentence.ValueKind == JsonValueKind.Array && sentence.GetArrayLength() > 0)
        {
            // Phần dịch nằm ở index 0 của mỗi sentence
            var translatedElement = sentence[0];
            if (translatedElement.ValueKind == JsonValueKind.String)
            {
                var translatedText = translatedElement.GetString();
                if (!string.IsNullOrWhiteSpace(translatedText))
                {
                    translatedParts.Add(translatedText.Trim());
                }
            }
        }
    }

    var result = string.Join(" ", translatedParts);
    
    Console.WriteLine($"[TranslationService] Final translated text ({targetLanguage}): {result}");
    Console.WriteLine($"[TranslationService] Translated {translatedParts.Count} sentence(s)");

    return result;
}
    }
}
