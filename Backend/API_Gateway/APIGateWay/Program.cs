using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;
using Consul;

namespace APIGateWay
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load Ocelot configuration
            builder.Configuration.AddJsonFile("ocelot.json");
            builder.Services.AddOcelot();

            // Add services to the container.
            builder.Services.AddControllers();

            // Add Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Add JWT authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer("JwtBearer", options =>
                {
                    var key = Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]);
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["JWT:Issuer"],
                        ValidAudience = builder.Configuration["JWT:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ClockSkew = TimeSpan.Zero // To ensure the expiration time is strictly enforced
                    };
                });

            // Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("clients-allowed", opt =>
                {
                    opt.AllowAnyMethod();
                    opt.AllowAnyHeader();
                    opt.AllowAnyOrigin();
                });
            });

            // Register with Consul
            var consulClient = new ConsulClient(c =>
            {
                c.Address = new Uri("http://localhost:8500"); // Consul server address
            });
            builder.Services.AddSingleton<IConsulClient>(consulClient);
            builder.Services.AddSingleton<IHostedService, ConsulHostedService>();

            var app = builder.Build();

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
            
            //Configure Cors
            app.UseCors("clients-allowed");

            // Map controllers and use Ocelot
            app.MapControllers();
            app.UseOcelot().Wait();
            
            app.Run();
        }
    }


    public class ConsulHostedService : IHostedService
    {
        private readonly IConsulClient _consulClient;
        private readonly string _serviceId;

        public ConsulHostedService(IConsulClient consulClient)
        {
            _consulClient = consulClient;
            _serviceId = Guid.NewGuid().ToString(); // Unique ID for this service instance
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var registration = new AgentServiceRegistration()
            {
                ID = _serviceId,
                Name = "APIGateway", // Name of the service
                Address = "localhost", // Address of the service
                Port = 5249, // Port the service is running on
                Check = new AgentServiceCheck()
                {
                    HTTP = $"http://localhost:5249/apigateway/health", // Health check URL
                    Interval = TimeSpan.FromSeconds(30) // Health check interval
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