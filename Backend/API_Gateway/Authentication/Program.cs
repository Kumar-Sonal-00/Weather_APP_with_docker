using Authentication.Models;
using Authentication.Repository;
using Authentication.Token_Generator;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Consul;

namespace Authentication
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

            builder.Services.AddScoped<IUserRepo, UserRepo>();
            builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();
            builder.Services.AddScoped<Userdbcontext>();

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
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

            app.UseHttpsRedirection();

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
            _serviceId = $"AuthenticationService-{Guid.NewGuid()}"; // Unique service ID

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
                    HTTP = $"http://localhost:{servicePort}/api/auth/health",
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