namespace DVDR_courses.Helpers
{
    public class FileStorageHelper
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly string _basePath;

        public FileStorageHelper(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
            _basePath = _env.IsDevelopment()
     ? _config.GetValue<string>("FileStorage:BasePath:Development") ?? throw new InvalidOperationException("Development base path not configured")
     : _config.GetValue<string>("FileStorage:BasePath:Production") ?? throw new InvalidOperationException("Production base path not configured");
        }

        public string GetStoragePath(string folderType, string folderName)
        {
            var relativePath = _config.GetValue<string>($"FileStorage:Folders:{folderType}")
                ?? throw new InvalidOperationException($"Configuration missing for folder type: {folderType}");
            return Path.Combine(_basePath, relativePath, folderName);
        }

        public string GetRelativePath(string folderType, string folderName, string fileName)
        {
            var relativePath = _config.GetValue<string>($"FileStorage:Folders:{folderType}");
            if (relativePath == null)
            {
                throw new InvalidOperationException($"Configuration missing for folder type: {folderType}");
            }
            return Path.Combine("assets", relativePath, folderName, fileName);
        }

        public async Task SaveFileAsync(IFormFile file, string fullPath)
        {
            var directoryPath = Path.GetDirectoryName(fullPath);
            if (directoryPath != null)
            {
                Directory.CreateDirectory(directoryPath);
            }
            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);
        }
    }
}
