using CourtCMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); // <--- CRITICAL: Registers the controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Get the connection string from Secrets (or appsettings.json)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Register the DbContext
builder.Services.AddDbContext<CourtDbContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("CourtCMS.Infrastructure")));
    
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Get the database context from the services
        var context = services.GetRequiredService<CourtDbContext>();
        
        // Run the seeder
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
