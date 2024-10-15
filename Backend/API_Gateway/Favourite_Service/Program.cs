using Consul;
using Favourite_Service.Models;
using Favourite_Service.Repository;
using Favourite_Service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Favourite_Service
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            // Add Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Ensure FavouriteDbContext is correctly configured with a connection string
            builder.Services.AddDbContext<FavouriteDbContext>(options =>
            {
                var conStr = builder.Configuration.GetConnectionString("conStr");
                options.UseSqlServer(conStr);
            });

            // Register repositories and services
            builder.Services.AddScoped<IFavouriteRepository, FavouriteRepository>();
            builder.Services.AddScoped<IFavouriteService, FavouriteService>();

            //add the jwt beared token authentication middleware
            builder.Services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(o =>
            {
                var key = Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]);
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = builder.Configuration["JWT:Issuer"],
                    ValidAudience = builder.Configuration["JWT:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("clients-allowed", opt =>
                {
                    opt.AllowAnyMethod();
                    opt.AllowAnyHeader();
                    opt.AllowAnyOrigin();
                });
            });

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
            }

            app.UseHttpsRedirection(); // Added HTTPS redirection for security

            // Use Authentication and Authorization middleware
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.UseCors("clients-allowed");
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
            _serviceId = $"FavouriteService-{Guid.NewGuid()}"; // Unique service ID

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
                    HTTP = $"http://localhost:{servicePort}/api/favourite/health",
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