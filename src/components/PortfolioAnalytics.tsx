
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AnalyticsData {
  id: string;
  share_id: string;
  view_date: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ChartData {
  date: string;
  views: number;
}

const PortfolioAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('portfolio_analytics')
          .select('*')
          .order('view_date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setAnalytics(data);
          
          // Process data for chart
          const groupedByDate = data.reduce((acc: Record<string, number>, item: AnalyticsData) => {
            const date = new Date(item.view_date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          
          const chartData = Object.entries(groupedByDate)
            .map(([date, views]) => ({ date, views }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setChartData(chartData);
        }
      } catch (error: any) {
        console.error("Error fetching analytics:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Portfolio View Analytics</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Views Over Time</h3>
          <div className="h-[300px] w-full">
            <ChartContainer 
              config={{ views: { label: "Views" }}}
              className="p-2"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ChartContainer>
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
              {analytics.length > 0 ? (
                analytics.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.view_date).toLocaleString()}</TableCell>
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
