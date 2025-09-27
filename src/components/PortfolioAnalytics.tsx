
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalyticsData {
  id: string;
  share_id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
  user_id: string;
  city: string | null;
  country: string | null;
  visitor_ip: string | null;
}

interface ChartData {
  date: string;
  views: number;
}

const PortfolioAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('portfolio_analytics')
        .select('*')
        .order('viewed_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setAnalytics(data);
        
        // Process data for chart
        const groupedByDate = data.reduce((acc: Record<string, number>, item: AnalyticsData) => {
          const date = new Date(item.viewed_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        const chartData = Object.entries(groupedByDate)
          .map(([date, views]) => ({ date, views: Number(views) }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setChartData(chartData);
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics();
      toast.success("Analytics refreshed successfully");
    } catch (error) {
      console.error("Error refreshing analytics:", error);
      toast.error("Failed to refresh analytics");
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Portfolio View Analytics</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Views Over Time</h3>
          <div className="h-[300px] w-full">
            {refreshing ? (
              <div className="h-full flex justify-center items-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} view${value !== 1 ? 's' : ''}`, 'Views']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="views" fill="#8884d8" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Recent Views</h3>
          <Table>
            <TableCaption>Portfolio view analytics</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Share ID</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refreshing ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <div className="flex justify-center">
                      <LoadingSpinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : analytics.length > 0 ? (
                analytics.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.viewed_at).toLocaleString()}</TableCell>
                    <TableCell>{item.share_id}</TableCell>
                    <TableCell>{item.referrer || 'Direct'}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{item.user_agent || 'Unknown'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No analytics data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;
