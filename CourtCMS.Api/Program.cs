using System.Net.Mime;
using CourtCMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); // <--- CRITICAL: Registers the controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============================================================
// CORS POLICY
// ============================================================
// In local development, Angular's proxy.conf.json forwards /api
// requests to localhost:5196, so CORS isn't needed.
//
// In production, the Angular app lives on a DIFFERENT domain
// (e.g. courtcms.azurestaticapps.net) than the API
// (e.g. courtcms-api.azurewebsites.net).
//
// Without CORS, the browser blocks all cross-domain API calls.
// This policy tells the browser: "requests from these origins are allowed."
// ============================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Get the connection string from Azure App Service (production)
// or User Secrets / appsettings.json (local development).
// Azure injects connection strings as environment variables that
// override whatever is in appsettings.json — so this line works
// in both environments without any code change.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Register the DbContext
builder.Services.AddDbContext<CourtDbContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("CourtCMS.Infrastructure")));
    
var app = builder.Build();

// ============================================================
// DATABASE MIGRATION + SEEDING
// ============================================================
// On first deploy to Azure, the database exists but has no tables.
// context.Database.Migrate() applies all EF Core migrations,
// creating the tables (Judges, CourtCases, Parties, etc.).
// Then DbInitializer.Initialize() seeds the initial data.
//
// On subsequent deploys, Migrate() is smart — it only runs
// migrations that haven't been applied yet. If nothing changed,
// it does nothing.
// ============================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<CourtDbContext>();

    // Retry up to 5 times — Azure SQL can take a few seconds to accept
    // connections when the app cold-starts.
    for (int attempt = 1; attempt <= 5; attempt++)
    {
        try
        {
            context.Database.Migrate();
            DbInitializer.Initialize(context);
            logger.LogInformation("Database migrated and seeded successfully on attempt {Attempt}.", attempt);
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database init attempt {Attempt}/5 failed.", attempt);
            if (attempt == 5)
                logger.LogError("All database init attempts failed. App will start without seeding.");
            else
                Thread.Sleep(5000); // Wait 5 seconds before retrying
        }
    }
}

// ============================================================
// MIDDLEWARE PIPELINE
// ============================================================

// Enable Swagger in ALL environments (not just Development).
// Recruiters visit /swagger to see API docs.
app.UseSwagger();
app.UseSwaggerUI();

// app.UseHttpsRedirection();

// Activate the CORS policy: must come BEFORE authorization.
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();
