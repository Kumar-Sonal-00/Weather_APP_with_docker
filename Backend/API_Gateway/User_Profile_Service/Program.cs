using Consul;
using Registration_Service.Models;
using Registration_Service.Repository;
using Registration_Service.ServiceRepo;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

//Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register services and repositories
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<UserDbContext>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

// CORS policy configuration
builder.Services.AddCors(op => op.AddPolicy("UserPolicy", plcy => plcy.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod()));

// Add Consul
builder.Services.AddSingleton<IConsulClient>(p =>
    new ConsulClient(cfg => { cfg.Address = new Uri("http://localhost:8500"); }));

builder.Services.AddHostedService<ConsulHostedService>();

var app = builder.Build();
app.UseCors("UserPolicy");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use Authentication and Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();



// Create a class to handle service registration with Consul
public class ConsulHostedService : IHostedService
{
    private readonly IConsulClient _consulClient;
    private readonly string _serviceId;
    private readonly IConfiguration _configuration; // Add IConfiguration

    public ConsulHostedService(IConsulClient consulClient, IConfiguration configuration)
    {
        _consulClient = consulClient;
        _configuration = configuration; // Store configuration
        _serviceId = $"RegistrationService-{Guid.NewGuid()}"; // Unique service ID

    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {

        // Retrieve service name and port from configuration
        var serviceName = _configuration["Service:Name"];
        var servicePort = _configuration.GetValue<int>("Service:Port");

        var registration = new AgentServiceRegistration()
        {
            ID = _serviceId,
            Name = serviceName,
            Address = "localhost", // Change to your service address if needed
            Port = servicePort, // Change to your service port
            Check = new AgentServiceCheck()
            {
                HTTP = $"http://localhost:{servicePort}/api/user/health",
                Interval = TimeSpan.FromSeconds(30)
            }
        };

        await _consulClient.Agent.ServiceRegister(registration);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await _consulClient.Agent.ServiceDeregister(_serviceId);
    }
}