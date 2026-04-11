namespace DocPlus.Entities.ViewModels
{
    public class DashboardVM :Base_VM
    {
        public int TotalPatients { get; set; }
        public int TodayAppointments { get; set; }
        public int NewPatients { get; set; }
        public int EmergencyCases { get; set; }

        public List<string>? AppointmentLabels { get; set; }
        public List<int>? AppointmentData { get; set; }

        public List<string>? DiseaseLabels { get; set; }
        public List<int>? DiseaseData { get; set; }

        public List<string>? RecentActivities { get; set; }
    }
}
