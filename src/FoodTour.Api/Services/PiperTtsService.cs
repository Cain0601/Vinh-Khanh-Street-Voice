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

        // private async Task<PiperProvider?> GetProviderForLanguageAsync(string langCode)
        // {
        //     Console.WriteLine($"[PiperTTS] GetProviderForLanguageAsync called | langCode={langCode}");
        //     // Normalize language code to model key
        //     string modelKey = langCode.ToLower() switch
        //     {
        //         "vi" => "vi_VN-vivos-medium",
        //         "vn" => "vi_VN-vivos-medium",
        //         "en" => "en_US-lessac-medium",
        //         "zh" => "zh_CN-huayan-medium",
        //         "cn" => "zh_CN-huayan-medium",
        //         "zh-cn" => "zh_CN-huayan-medium",
        //         "ja" => "ja_JP-jvnv-medium",
        //         "jp" => "ja_JP-jvnv-medium",
        //         "fr" => "fr_FR-siwis-medium",
        //         "es" => "es_ES-sharvard-medium",
        //         _ => "en_US-lessac-medium" // Fallback to English
        //     };
        //     Console.WriteLine($"[PiperTTS] Resolved modelKey='{modelKey}' for langCode='{langCode}'.");

        //     if (_providers.TryGetValue(modelKey, out var existingProvider))
        //     {
        //         Console.WriteLine("[PiperTTS] Provider found in cache.");
        //         return existingProvider;
        //     }

        //     await _downloadLock.WaitAsync();
        //     try
        //     {
        //         // Double check after lock
        //         if (_providers.TryGetValue(modelKey, out var providerAfterLock))
        //         {
        //             Console.WriteLine("[PiperTTS] Provider found in cache after acquiring lock.");
        //             return providerAfterLock;
        //         }

        //         // Determine base path for piper_tts. Prefer the folder alongside the project source if it exists.
        //         var assemblyDir = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        //         string cwd;
        //         if (assemblyDir != null)
        //         {
        //             // Possible location three levels up from the bin output (project root location).
        //             var fallbackPath = Path.GetFullPath(Path.Combine(assemblyDir, "..", "..", "..", "piper_tts"));
        //             var directPath = Path.Combine(assemblyDir, "piper_tts");
        //             cwd = Directory.Exists(fallbackPath) ? fallbackPath : directPath;
        //         }
        //         else
        //         {
        //             cwd = Path.Combine(Directory.GetCurrentDirectory(), "piper_tts");
        //         }
        //         if (!Directory.Exists(cwd)) Directory.CreateDirectory(cwd);

        //         // Ensure the process working directory matches the Piper base folder so that VoiceModel.LoadModelByKey
        //         // can locate the model under the expected "models" sub‑directory.
        //         Directory.SetCurrentDirectory(cwd);

        //         if (!_piperDownloaded)
        //         {
        //             var piperDir = Path.Combine(cwd, "piper");
        //             if (!Directory.Exists(piperDir))
        //             {
        //                 Console.WriteLine("[PiperTTS] Piper executable not found – downloading now.");
        //                 var stream = await PiperDownloader.DownloadPiper();
        //                 PiperDownloader.ExtractPiper(stream, cwd);
        //                 Console.WriteLine("[PiperTTS] Piper executable downloaded and extracted.");
        //             }
        //             _piperDownloaded = true;
        //         }

        //         // Download model
        //         // Use a dedicated 'models' subfolder under the piper_tts working directory.
        //         var modelsRoot = Path.Combine(cwd, "models");
        //         Directory.CreateDirectory(modelsRoot);
        //         var expectedModelPath = Path.Combine(modelsRoot, modelKey);
        //         Console.WriteLine($"[PiperTTS] Expected model folder: {expectedModelPath} | Exists? {Directory.Exists(expectedModelPath)}");
        //         // Ensure a generic model.json exists for PiperSharp if missing
        //         if (Directory.Exists(expectedModelPath) && !File.Exists(Path.Combine(expectedModelPath, "model.json")))
        //         {
        //             var onnxJson = Directory.GetFiles(expectedModelPath, "*.onnx.json").FirstOrDefault();
        //             if (!string.IsNullOrEmpty(onnxJson))
        //             {
        //                 var modelJsonPath = Path.Combine(expectedModelPath, "model.json");
        //                 File.Copy(onnxJson, modelJsonPath, overwrite: true);
        //                 Console.WriteLine("[PiperTTS] model.json created from .onnx.json.");
        //             }
        //         }

        //         var model = await VoiceModel.LoadModelByKey(modelKey);
        //         if (model == null)
        //         {
        //             // If not found, maybe the model was placed under the "piper" sub‑folder (common mistake).
        //             var fallbackPath = Path.Combine(cwd, "piper", modelKey);
        //             if (Directory.Exists(fallbackPath))
        //             {
        //                 Console.WriteLine($"[PiperTTS] Model found in fallback location: {fallbackPath}. Adding to search path.");
        //                 // Copy the fallback files into the proper models folder.
        //                 var targetPath = expectedModelPath;
        //                 Directory.CreateDirectory(targetPath);
        //                 foreach (var file in Directory.GetFiles(fallbackPath))
        //                 {
        //                     var dest = Path.Combine(targetPath, Path.GetFileName(file));
        //                     File.Copy(file, dest, overwrite: true);
        //                 }
        //                 // Ensure a generic model.json exists for PiperSharp (copy from *.onnx.json if present)
        //                 var onnxJson = Directory.GetFiles(targetPath, "*.onnx.json").FirstOrDefault();
        //                 if (!string.IsNullOrEmpty(onnxJson))
        //                 {
        //                     var modelJsonPath = Path.Combine(targetPath, "model.json");
        //                     File.Copy(onnxJson, modelJsonPath, overwrite: true);
        //                 }
        //                 Console.WriteLine($"[PiperTTS] Model files copied to expected location.");
        //                 model = await VoiceModel.LoadModelByKey(modelKey);
        //             }
        //             else
        //             {
        //                 Console.WriteLine($"[PiperTTS] Model '{modelKey}' not found locally – downloading.");
        //                 await PiperDownloader.DownloadModelByKey(modelKey);
        //                 // After download, the downloader places files under cwd/piper/models; move them to our modelsRoot.
        //                 var downloadedPath = Path.Combine(cwd, "piper", "models", modelKey);
        //                 if (Directory.Exists(downloadedPath))
        //                 {
        //                     Directory.CreateDirectory(expectedModelPath);
        //                     foreach (var file in Directory.GetFiles(downloadedPath))
        //                     {
        //                         var dest = Path.Combine(expectedModelPath, Path.GetFileName(file));
        //                         File.Copy(file, dest, overwrite: true);
        //                     }
        //                     // Also copy any *.onnx.json to a generic model.json for PiperSharp compatibility
        //                     var onnxJson = Directory.GetFiles(expectedModelPath, "*.onnx.json").FirstOrDefault();
        //                     if (!string.IsNullOrEmpty(onnxJson))
        //                     {
        //                         var modelJsonPath = Path.Combine(expectedModelPath, "model.json");
        //                         File.Copy(onnxJson, modelJsonPath, overwrite: true);
        //                     }
        //                 }
        //                 model = await VoiceModel.LoadModelByKey(modelKey);
        //                 Console.WriteLine($"[PiperTTS] Model '{modelKey}' download completed.");
        //             }
        //         }

        //         if (model != null)
        //         {
        //             // Log the files that actually exist in the model folder for debugging
        //             try
        //             {
        //                 var files = Directory.GetFiles(expectedModelPath);
        //                 Console.WriteLine($"[PiperTTS] Files in model folder ({expectedModelPath}): {string.Join(", ", files)}");
        //             }
        //             catch (Exception dirEx)
        //             {
        //                 Console.WriteLine($"[PiperTTS] Unable to list files in model folder: {dirEx.Message}");
        //             }

        //             var config = new PiperConfiguration()
        //             {
        //                 ExecutableLocation = Path.Combine(cwd, "piper", "piper.exe"),
        //                 WorkingDirectory = cwd,
        //                 Model = model
        //             };

        //             Console.WriteLine("[PiperTTS] Creating PiperProvider with loaded model.");
        //             var provider = new PiperProvider(config);
        //             _providers.TryAdd(modelKey, provider);
        //             Console.WriteLine("[PiperTTS] Provider created and cached.");
        //             return provider;
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine($"Error initializing Piper TTS for {langCode}: {ex.Message}");
        //     }
        //     finally
        //     {
        //         _downloadLock.Release();
        //     }

        //     return null;
        // }
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
