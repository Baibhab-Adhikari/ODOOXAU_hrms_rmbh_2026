import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

// Salary structure response type
type SalaryStructure = {
  id: string;
  basic_pay: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  effective_from: string;
  salary_components: {
    wage: number;
    basic: { amount: number };
    allowances: {
      hra: { amount: number };
      standard_allowance: number;
      performance_bonus: number;
      leave_travel_allowance: number;
      fixed_allowance: number;
      total: number;
    };
    deductions: {
      provident_fund: { amount: number };
      professional_tax: number;
      total: number;
    };
    net_pay: number;
  } | null;
};

export default function Salary() {
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const res = await api.get("/salary-structures/me");
        setSalary(res.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setErrorMsg("No salary structure found for your profile.");
        } else {
          console.error("Failed to load salary", error);
          setErrorMsg("Failed to load salary information.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg || !salary) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium max-w-2xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg || "Failed to load salary structure."}</span>
        </div>
      </div>
    );
  }

  const allowanceBreakdown = salary.salary_components ? [
    { label: "House Rent Allowance (HRA)", amount: salary.salary_components.allowances.hra.amount },
    { label: "Standard Allowance", amount: salary.salary_components.allowances.standard_allowance },
    { label: "Performance Bonus", amount: salary.salary_components.allowances.performance_bonus },
    { label: "Leave Travel Allowance", amount: salary.salary_components.allowances.leave_travel_allowance },
    { label: "Fixed Allowance", amount: salary.salary_components.allowances.fixed_allowance },
  ].filter(a => a.amount > 0) : [];

  const deductionBreakdown = salary.salary_components ? [
    { label: "Provident Fund (PF)", amount: salary.salary_components.deductions.provident_fund.amount },
    { label: "Professional Tax", amount: salary.salary_components.deductions.professional_tax },
  ].filter(d => d.amount > 0) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Salary</h1>
        <p className="text-muted-foreground mt-1">Your compensation details</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Net Pay Highlight */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 font-medium">Net Monthly Pay</p>
                <p className="text-primary-foreground text-4xl font-bold mt-1">₹{salary.net_pay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-primary-foreground/60 text-sm mt-2">
                  Effective from {new Date(salary.effective_from).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary-foreground/10">
                <Wallet className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">BASIC PAY</p>
                  <p className="text-xl font-bold text-foreground">₹{salary.basic_pay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TOTAL ALLOWANCES</p>
                  <p className="text-xl font-bold text-emerald-500">+ ₹{salary.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TOTAL DEDUCTIONS</p>
                  <p className="text-xl font-bold text-destructive">- ₹{salary.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allowance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Allowances Breakdown</span>
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">+ ₹{salary.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allowanceBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-sm text-emerald-500 font-medium">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {i < allowanceBreakdown.length - 1 && <Separator />}
                  </div>
                ))}
                {allowanceBreakdown.length === 0 && (
                  <div className="py-2 text-sm text-muted-foreground">No allowances.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deduction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Deductions Breakdown</span>
                <Badge variant="error">- ₹{salary.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deductionBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-sm text-destructive font-medium">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {i < deductionBreakdown.length - 1 && <Separator />}
                  </div>
                ))}
                {deductionBreakdown.length === 0 && (
                  <div className="py-2 text-sm text-muted-foreground">No deductions.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
