import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  CalendarCheck,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface BusinessAnalyticsProps {
  businessId: string;
}

export const BusinessAnalytics = ({ businessId }: BusinessAnalyticsProps) => {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments({
    businessId,
  });
  
  const { data: services, isLoading: servicesLoading } = useServices(businessId);

  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter appointments (handle null/undefined)
    const allAppointments = appointments || [];
    const last30DaysAppointments = allAppointments.filter((apt) => {
      const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
      return aptDate >= last30Days;
    });
    const last7DaysAppointments = allAppointments.filter((apt) => {
      const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
      return aptDate >= last7Days;
    });

    // Calculate statistics
    const totalBookings = allAppointments.length;
    const confirmedBookings = allAppointments.filter((apt) => apt.status === "confirmed").length;
    const completedBookings = allAppointments.filter((apt) => apt.status === "completed").length;
    const cancelledBookings = allAppointments.filter((apt) => apt.status === "cancelled").length;
    const pendingBookings = allAppointments.filter((apt) => apt.status === "pending").length;

    // Revenue calculation (only completed appointments)
    const totalRevenue = allAppointments
      .filter((apt) => apt.status === "completed" && apt.service?.price)
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    const last30DaysRevenue = last30DaysAppointments
      .filter((apt) => apt.status === "completed" && apt.service?.price)
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    const last7DaysRevenue = last7DaysAppointments
      .filter((apt) => apt.status === "completed" && apt.service?.price)
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    // Popular services
    const serviceBookings = new Map<string, { name: string; count: number; revenue: number }>();
    allAppointments
      .filter((apt) => apt.service)
      .forEach((apt) => {
        const serviceId = apt.service_id;
        const serviceName = apt.service?.name || "Unknown";
        const servicePrice = apt.service?.price || 0;
        
        if (!serviceBookings.has(serviceId)) {
          serviceBookings.set(serviceId, { name: serviceName, count: 0, revenue: 0 });
        }
        const current = serviceBookings.get(serviceId)!;
        current.count += 1;
        if (apt.status === "completed") {
          current.revenue += servicePrice;
        }
      });

    const popularServices = Array.from(serviceBookings.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Peak hours analysis
    const hourBookings = new Map<number, number>();
    allAppointments.forEach((apt) => {
      const [hours] = apt.appointment_time.split(":").map(Number);
      const hour = hours % 24;
      hourBookings.set(hour, (hourBookings.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourBookings.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Customer retention
    const uniqueCustomers = new Set(allAppointments.map((apt) => apt.customer_id));
    const returningCustomers = new Set<string>();
    const customerBookingCounts = new Map<string, number>();
    
    allAppointments.forEach((apt) => {
      const count = (customerBookingCounts.get(apt.customer_id) || 0) + 1;
      customerBookingCounts.set(apt.customer_id, count);
      if (count > 1) {
        returningCustomers.add(apt.customer_id);
      }
    });

    const retentionRate = uniqueCustomers.size > 0
      ? (returningCustomers.size / uniqueCustomers.size) * 100
      : 0;

    // Booking trends (last 7 days)
    const dailyBookings = new Map<string, number>();
    last7DaysAppointments.forEach((apt) => {
      const dateKey = apt.appointment_date;
      dailyBookings.set(dateKey, (dailyBookings.get(dateKey) || 0) + 1);
    });

    // Conversion rate (confirmed / total)
    const conversionRate = totalBookings > 0
      ? (confirmedBookings / totalBookings) * 100
      : 0;

    // Cancellation rate
    const cancellationRate = totalBookings > 0
      ? (cancelledBookings / totalBookings) * 100
      : 0;

    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
      last30DaysRevenue,
      last7DaysRevenue,
      popularServices,
      peakHours,
      uniqueCustomers: uniqueCustomers.size,
      returningCustomers: returningCustomers.size,
      retentionRate,
      conversionRate,
      cancellationRate,
      dailyBookings: Array.from(dailyBookings.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [appointments, services]);

  if (appointmentsLoading || servicesLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Always show analytics, even with zero data
  if (!analytics) {
    // This shouldn't happen, but provide fallback
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
        <p className="text-muted-foreground">
          Track your business performance and customer insights
        </p>
      </div>

      {/* Empty State Banner */}
      {analytics.totalBookings === 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">No bookings yet</p>
                <p className="text-sm text-blue-700 mt-1">
                  Once customers start booking appointments, you'll see detailed analytics here including revenue, popular services, and peak hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.pendingBookings} pending, {analytics.confirmedBookings} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.last30DaysRevenue)} last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.retentionRate.toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>Top 5 most booked services</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.popularServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.count} bookings • {formatCurrency(service.revenue)} revenue
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Most popular booking times</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.peakHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.peakHours.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatHour(item.hour)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / analytics.peakHours[0].count) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Overview of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{analytics.completedBookings}</span>
                  <span className="text-xs text-muted-foreground">
                    ({((analytics.completedBookings / analytics.totalBookings) * 100 || 0).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{analytics.confirmedBookings}</span>
                  <span className="text-xs text-muted-foreground">
                    ({((analytics.confirmedBookings / analytics.totalBookings) * 100 || 0).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{analytics.pendingBookings}</span>
                  <span className="text-xs text-muted-foreground">
                    ({((analytics.pendingBookings / analytics.totalBookings) * 100 || 0).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cancelled</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{analytics.cancelledBookings}</span>
                  <span className="text-xs text-muted-foreground">
                    ({analytics.cancellationRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Customer retention and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Customers</span>
                <span className="text-lg font-semibold">{analytics.uniqueCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Returning Customers</span>
                <span className="text-lg font-semibold">{analytics.returningCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Retention Rate</span>
                <span className="text-lg font-semibold">{analytics.retentionRate.toFixed(1)}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {analytics.returningCustomers > 0
                      ? `${analytics.returningCustomers} customers have booked multiple times`
                      : "No repeat customers yet"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          <CardDescription>Daily booking trends</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings in the last 7 days</p>
          ) : (
            <div className="space-y-2">
              {analytics.dailyBookings.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm">
                    {format(new Date(day.date), "EEE, MMM dd")}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(day.count / Math.max(...analytics.dailyBookings.map((d) => d.count))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

