using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using PiperSharp;
using PiperSharp.Models;
using System.Linq;

namespace FoodTour.Api.Services
{
    public class PiperTtsService
    {
        private static bool _piperDownloaded = false;
        private static readonly SemaphoreSlim _downloadLock = new SemaphoreSlim(1, 1);
        private readonly ConcurrentDictionary<string, PiperProvider> _providers = new();

        public async Task<byte[]?> GenerateSpeechAsync(string text, string langCode)
        {
            Console.WriteLine($"[PiperTTS] GenerateSpeechAsync called | langCode={langCode} | textLength={(text?.Length ?? 0)}");
            if (string.IsNullOrWhiteSpace(text))
            {
                Console.WriteLine("[PiperTTS] Input text is null or whitespace – returning null.");
                return null;
            }

            var provider = await GetProviderForLanguageAsync(langCode);
            if (provider == null)
            {
                Console.WriteLine($"[PiperTTS] No provider available for language '{langCode}'. Returning null.");
                return null;
            }

            Console.WriteLine("[PiperTTS] Provider obtained – starting inference.");
            // (AudioOutputType)0 is usually Wav or default
            var audioData = await provider.InferAsync(text, AudioOutputType.Wav, CancellationToken.None);
            Console.WriteLine($"[PiperTTS] Inference completed – audio data length: {(audioData?.Length ?? 0)} bytes.");
            Console.WriteLine( BitConverter.ToString(audioData.Take(12).ToArray()) );
            return audioData;
        }

        private async Task<PiperProvider?> GetProviderForLanguageAsync(string langCode)
{
    Console.WriteLine($"[PiperTTS] GetProviderForLanguageAsync called | langCode={langCode}");

    string modelKey = langCode.ToLower() switch
    {
        "vi" or "vn" => "vi_VN-vais1000-medium",
        "en" => "en_US-lessac-medium",
        "zh" or "cn" or "zh-cn" => "zh_CN-huayan-medium",
        "ja" or "jp" => "ja_JP-jvnv-medium",
        "fr" => "fr_FR-siwis-medium",
        "es" => "es_ES-sharvard-medium",
        "hi" => "hi_IN-pratham-medium",
        "ar" => "ar_JO-kareem-medium",
        "pt" => "pt_BR-faber-medium",           // hoặc pt_PT nếu thích
        "ru" => "ru_RU-irina-medium",
        "id" => "id_ID-eka-medium",
        "ko" => "ko_KR-kyeoni-medium",
        "de" => "de_DE-eva_k-medium",
        "it" => "it_IT-paola-medium",
        "th" => "th_TH-ponpirun-medium",
        _ => "en_US-lessac-medium"
    };

    Console.WriteLine($"[PiperTTS] Using modelKey = {modelKey}");

    if (_providers.TryGetValue(modelKey, out var existing))
    {
        Console.WriteLine("[PiperTTS] ✅ Provider found in cache.");
        return existing;
    }

    await _downloadLock.WaitAsync();
    try
    {
        if (_providers.TryGetValue(modelKey, out var cached)) return cached;

        var cwd = GetPiperBasePath();
        Console.WriteLine($"[PiperTTS] Working directory: {cwd}");
        Directory.SetCurrentDirectory(cwd);

        // Download piper
        if (!_piperDownloaded)
        {
            var piperExe = Path.Combine(cwd, "piper", "piper.exe");
            if (!File.Exists(piperExe))
            {
                Console.WriteLine("[PiperTTS] ⬇️ Downloading piper.exe...");
                var stream = await PiperDownloader.DownloadPiper();
                PiperDownloader.ExtractPiper(stream, cwd);
                Console.WriteLine("[PiperTTS] ✅ Piper extracted.");
            }
            _piperDownloaded = true;
        }

       // Load or Download model
        Console.WriteLine($"[PiperTTS] ⬇️ Trying to load model: {modelKey}");
        VoiceModel model = null;

        try
        {
            model = await VoiceModel.LoadModelByKey(modelKey);
            Console.WriteLine($"[PiperTTS] LoadModelByKey succeeded.");
        }
        catch (Exception loadEx)
        {
            Console.WriteLine($"[PiperTTS] LoadModelByKey failed: {loadEx.Message}");
        }

        if (model == null || model.ModelLocation == null || model.Files == null || !model.Files.Any())
        {
            Console.WriteLine($"[PiperTTS] Model invalid or missing Files dict → Downloading now...");
            model = await PiperDownloader.DownloadModelByKey(modelKey);  // <-- Quan trọng: dùng cái này
            Console.WriteLine($"[PiperTTS] ✅ DownloadModelByKey completed.");
        }

        // Debug
        Console.WriteLine($"[PiperTTS] ModelLocation = {model?.ModelLocation ?? "NULL"}");
        if (model?.ModelLocation != null)
        {
            Console.WriteLine($"[PiperTTS] Files count: {model.Files?.Count ?? 0}");
            Console.WriteLine($"[PiperTTS] Model files: {string.Join(", ", Directory.GetFiles(model.ModelLocation))}");
        }

        var config = new PiperConfiguration
        {
            ExecutableLocation = Path.Combine(cwd, "piper", "piper.exe"),
            WorkingDirectory = cwd,
            Model = model
        };

        if (config.Model?.Files == null)
            Console.WriteLine("[PiperTTS] ⚠️ WARNING: Model.Files is null!");

        var provider = new PiperProvider(config);
        _providers.TryAdd(modelKey, provider);

        Console.WriteLine($"[PiperTTS] ✅ Provider created successfully for {modelKey}");
        return provider;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[PiperTTS] ❌ ERROR: {ex.Message}\n{ex.StackTrace}");
        return null;
    }
    finally
    {
        _downloadLock.Release();
    }
}// Helper lấy đường dẫn
private string GetPiperBasePath()
{
    var assemblyDir = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
    if (assemblyDir == null) 
        return Path.Combine(Directory.GetCurrentDirectory(), "piper_tts");

    // Ưu tiên folder source (phù hợp dev)
    var projectPath = Path.GetFullPath(Path.Combine(assemblyDir, "..", "..", "..", "piper_tts"));
    if (Directory.Exists(projectPath))
        return projectPath;

    // Fallback
    return Path.Combine(assemblyDir, "piper_tts");
}
    }
}
