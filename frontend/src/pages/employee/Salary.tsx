import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { SalaryStructure } from "@/types";

const mockSalary: SalaryStructure = {
  basicPay: 65000,
  allowances: 22000,
  deductions: 8500,
  netPay: 78500,
  effectiveFrom: "2026-01-01",
};

const allowanceBreakdown = [
  { label: "House Rent Allowance (HRA)", amount: 12000 },
  { label: "Transport Allowance", amount: 3000 },
  { label: "Medical Allowance", amount: 2500 },
  { label: "Special Allowance", amount: 4500 },
];

const deductionBreakdown = [
  { label: "Provident Fund (PF)", amount: 4500 },
  { label: "Professional Tax", amount: 200 },
  { label: "Income Tax (TDS)", amount: 3800 },
];

export default function Salary() {
  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Salary</h1>
        <p className="text-muted-foreground mt-1">Your compensation details</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Net Pay Highlight */}
        <Card className="bg-gradient-to-r from-primary to-primary-container border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-primary/80 text-title-md">Net Monthly Pay</p>
                <p className="text-on-primary text-display-lg mt-1">₹{mockSalary.netPay.toLocaleString()}</p>
                <p className="text-on-primary/60 text-caption mt-2">
                  Effective from {new Date(mockSalary.effectiveFrom).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-on-primary/10">
                <Wallet className="h-10 w-10 text-on-primary" />
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
                  <p className="text-label-md text-on-surface-variant">BASIC PAY</p>
                  <p className="text-headline-md text-on-surface">₹{mockSalary.basicPay.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-label-md text-on-surface-variant">TOTAL ALLOWANCES</p>
                  <p className="text-headline-md text-success">+ ₹{mockSalary.allowances.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-error/10">
                  <TrendingDown className="h-5 w-5 text-error" />
                </div>
                <div>
                  <p className="text-label-md text-on-surface-variant">TOTAL DEDUCTIONS</p>
                  <p className="text-headline-md text-error">- ₹{mockSalary.deductions.toLocaleString()}</p>
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
                <Badge variant="success">+ ₹{mockSalary.allowances.toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allowanceBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-body-md text-on-surface">{item.label}</span>
                      <span className="text-body-md text-success font-medium">
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                    {i < allowanceBreakdown.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deduction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Deductions Breakdown</span>
                <Badge variant="error">- ₹{mockSalary.deductions.toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deductionBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-body-md text-on-surface">{item.label}</span>
                      <span className="text-body-md text-error font-medium">
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                    {i < deductionBreakdown.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
