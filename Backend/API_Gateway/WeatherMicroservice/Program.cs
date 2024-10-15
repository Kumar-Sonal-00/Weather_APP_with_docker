using Consul;
using WeatherMicroservice.Services;

namespace WeatherMicroservice
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddHttpClient();
            builder.Services.AddScoped<IWeatherService, WeatherService>();
            builder.Services.AddScoped<IGeocodingService, GeocodingService>();

            builder.Services.AddControllers();

            // Configure CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });

            // Add Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Add Consul
            builder.Services.AddSingleton<IConsulClient>(p =>
                new ConsulClient(cfg => { cfg.Address = new Uri("http://localhost:8500"); }));

            builder.Services.AddHostedService<ConsulHostedService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseDeveloperExceptionPage();
            }
            else
            {
                
                app.UseExceptionHandler("/error"); // Point to a generic error handler
            }
            app.UseHttpsRedirection();

            // Use CORS policy
            app.UseCors("AllowAllOrigins");

            // Use Authentication and Authorization middleware
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }


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
            _serviceId = $"WeatherService-{Guid.NewGuid()}"; // Unique service ID

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
                    HTTP = $"http://localhost:{servicePort}/api/weather/health",
                    Interval = TimeSpan.FromSeconds(10)
                }
            };

            await _consulClient.Agent.ServiceRegister(registration);
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await _consulClient.Agent.ServiceDeregister(_serviceId);
        }
    }
}