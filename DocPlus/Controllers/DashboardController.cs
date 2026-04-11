using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using DocPlus.Entities.ViewModels;
using DocPlus.Utilities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace DocPlus.Controllers
{
    public class DashboardController : BaseController
    {
        public DashboardController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }

        public IActionResult Index()
        {
            var model = new DashboardVM
            {
                TotalPatients = 12540,
                TodayAppointments = 210,
                NewPatients = 45,
                EmergencyCases = 6,

                AppointmentLabels = new List<string> { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" },
                AppointmentData = new List<int> { 120, 150, 180, 200, 170, 140 },

                DiseaseLabels = new List<string> { "Hypertension", "Diabetes", "Cold", "Fever" },
                DiseaseData = new List<int> { 120, 90, 70, 50 },

                RecentActivities = new List<string>
        {
            "Patient Registered – John Smith",
            "Prescription Added – Dr Patel",
            "Appointment Booked – Maria",
            "Lab Result Uploaded"
        }
            };

            return View(model);
        }

    }
}