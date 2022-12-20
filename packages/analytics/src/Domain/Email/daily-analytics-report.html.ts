/* eslint-disable @typescript-eslint/no-explicit-any */
import { TimerInterface } from '@standardnotes/time'

import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { StatisticMeasureName } from '../Statistics/StatisticMeasureName'
import { Period } from '../Time/Period'

const countActiveUsers = (measureName: string, data: any): { yesterday: number; last30Days: number } => {
  const totalActiveUsersLast30DaysIncludingToday = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === measureName && a.period === 27,
  )

  const totalActiveUsersYesterday =
    totalActiveUsersLast30DaysIncludingToday.counts[totalActiveUsersLast30DaysIncludingToday.counts.length - 2]
      .totalCount

  const filteredCounts = totalActiveUsersLast30DaysIncludingToday.counts.filter(
    (count: { totalCount: number }) => count.totalCount !== 0,
  )
  if (filteredCounts.length === 0) {
    return {
      yesterday: 0,
      last30Days: 0,
    }
  }

  const last30DaysNumbers = filteredCounts.map((count: { totalCount: number }) => count.totalCount)
  const last30DaysCount = last30DaysNumbers.reduce((previousValue: number, currentValue: number) => {
    return previousValue + currentValue
  })

  const averageActiveUsersLast30Days = Math.floor(last30DaysCount / last30DaysNumbers.length)

  return {
    yesterday: totalActiveUsersYesterday,
    last30Days: averageActiveUsersLast30Days,
  }
}

const getChartUrls = (
  data: any,
): {
  subscriptions: string
  users: string
  quarterlyPerformance: string
  churn: string
  mrrMonthly: string
} => {
  const subscriptionPurchasingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionPurchased && a.period === Period.Last30Days,
  )
  const subscriptionRenewingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionRenewed && a.period === Period.Last30Days,
  )
  const subscriptionRefundingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionRefunded && a.period === Period.Last30Days,
  )
  const subscriptionCancelledOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionCancelled && a.period === Period.Last30Days,
  )
  const subscriptionReactivatedOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionReactivated && a.period === Period.Last30Days,
  )

  const subscriptionsLinerOverTimeConfig = {
    type: 'line',
    data: {
      labels: subscriptionPurchasingOverTime?.counts.map((count: { periodKey: any }) => count.periodKey),
      datasets: [
        {
          label: 'Subscription Purchases',
          backgroundColor: 'rgb(25, 255, 140)',
          borderColor: 'rgb(25, 255, 140)',
          data: subscriptionPurchasingOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
        {
          label: 'Subscription Renewals',
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgb(54, 162, 235)',
          data: subscriptionRenewingOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
        {
          label: 'Subscription Refunds',
          backgroundColor: 'rgb(255, 221, 51)',
          borderColor: 'rgb(255, 221, 51)',
          data: subscriptionRefundingOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
        {
          label: 'Subscription Cancels',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: subscriptionCancelledOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
        {
          label: 'Subscription Reactivations',
          backgroundColor: 'rgb(221, 51, 255)',
          borderColor: 'rgb(221, 51, 255)',
          data: subscriptionReactivatedOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
      ],
    },
  }

  const userRegistrationOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.Register && a.period === Period.Last30Days,
  )
  const userDeletionOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.DeleteAccount && a.period === Period.Last30Days,
  )

  const usersLinerOverTimeConfig = {
    type: 'line',
    data: {
      labels: userRegistrationOverTime?.counts.map((count: { periodKey: any }) => count.periodKey),
      datasets: [
        {
          label: 'User Registrations',
          backgroundColor: 'rgb(25, 255, 140)',
          borderColor: 'rgb(25, 255, 140)',
          data: userRegistrationOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
        {
          label: 'Account Deletions',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: userDeletionOverTime?.counts.map((count: { totalCount: any }) => count.totalCount),
          fill: false,
          pointRadius: 2,
        },
      ],
    },
  }

  const quarters = [Period.Q1ThisYear, Period.Q2ThisYear, Period.Q3ThisYear, Period.Q4ThisYear]
  const quarterlyUserRegistrations = []
  const quarterlySubscriptionPurchases = []
  const quarterlySubscriptionRenewals = []
  for (const quarter of quarters) {
    const registrations =
      data.activityStatisticsOverTime.find(
        (a: { name: AnalyticsActivity; period: Period }) =>
          a.name === AnalyticsActivity.Register && a.period === quarter,
      )?.totalCount ?? 0
    const purchases =
      data.activityStatisticsOverTime.find(
        (a: { name: AnalyticsActivity; period: Period }) =>
          a.name === AnalyticsActivity.SubscriptionPurchased && a.period === quarter,
      )?.totalCount ?? 0
    const renewals =
      data.activityStatisticsOverTime.find(
        (a: { name: AnalyticsActivity; period: Period }) =>
          a.name === AnalyticsActivity.SubscriptionRenewed && a.period === quarter,
      )?.totalCount ?? 0
    quarterlyUserRegistrations.push(registrations)
    quarterlySubscriptionPurchases.push(purchases)
    quarterlySubscriptionRenewals.push(renewals)
  }

  const quarterlyConfig = {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'User Registrations',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          data: quarterlyUserRegistrations,
        },
        {
          label: 'Subscription Purchases',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          data: quarterlySubscriptionPurchases,
        },
        {
          label: 'Subscription Renewals',
          backgroundColor: 'rgb(25, 255, 140, 0.5)',
          borderColor: 'rgb(25, 255, 140)',
          borderWidth: 1,
          data: quarterlySubscriptionRenewals,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Quarterly Performance',
      },
      plugins: {
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#666',
          font: {
            weight: 'normal',
          },
        },
      },
    },
  }

  const monthlyChurnRates = data.churn.values.map((value: { rate: number }) => +value.rate.toFixed(2))

  const churnConfig = {
    type: 'bar',
    data: {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      datasets: [
        {
          label: 'Churn Percent',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          data: monthlyChurnRates,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Monthly Churn Rate',
      },
      plugins: {
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#666',
          font: {
            weight: 'normal',
          },
        },
      },
    },
  }

  const mrrMonthlyOverTime = data.statisticsOverTime
    .find((a: { name: string; period: Period }) => a.name === 'mrr' && a.period === Period.ThisYear)
    ?.counts.map((count: { totalCount: number }) => +count.totalCount.toFixed(2))

  const mrrMonthlyConfig = {
    type: 'bar',
    data: {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      datasets: [
        {
          label: 'MRR',
          backgroundColor: 'rgba(25, 255, 140, 0.5)',
          borderColor: 'rgb(25, 255, 140)',
          borderWidth: 1,
          data: mrrMonthlyOverTime,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: 'Monthly MRR',
      },
      plugins: {
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#666',
          font: {
            weight: 'normal',
          },
        },
      },
    },
  }

  return {
    subscriptions: `https://quickchart.io/chart?width=800&c=${encodeURIComponent(
      JSON.stringify(subscriptionsLinerOverTimeConfig),
    )}`,
    users: `https://quickchart.io/chart?width=800&c=${encodeURIComponent(JSON.stringify(usersLinerOverTimeConfig))}`,
    quarterlyPerformance: `https://quickchart.io/chart?width=800&c=${encodeURIComponent(
      JSON.stringify(quarterlyConfig),
    )}`,
    churn: `https://quickchart.io/chart?width=800&c=${encodeURIComponent(JSON.stringify(churnConfig))}`,
    mrrMonthly: `https://quickchart.io/chart?width=800&c=${encodeURIComponent(JSON.stringify(mrrMonthlyConfig))}`,
  }
}

export const html = (data: any, timer: TimerInterface) => {
  const chartUrls = getChartUrls(data)

  const successfullPaymentsActivity = data.activityStatistics.find(
    (a: { name: AnalyticsActivity }) => a.name === AnalyticsActivity.PaymentSuccess && Period.Yesterday,
  )
  const failedPaymentsActivity = data.activityStatistics.find(
    (a: { name: AnalyticsActivity }) => a.name === AnalyticsActivity.PaymentFailed && Period.Yesterday,
  )
  const limitedDiscountPurchasedActivity = data.activityStatistics.find(
    (a: { name: AnalyticsActivity }) => a.name === AnalyticsActivity.LimitedDiscountOfferPurchased && Period.Yesterday,
  )
  const subscriptionPurchasingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionPurchased && a.period === Period.Last30Days,
  )
  const subscriptionRenewingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionRenewed && a.period === Period.Last30Days,
  )
  const subscriptionRefundingOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionRefunded && a.period === Period.Last30Days,
  )
  const subscriptionCancelledOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionCancelled && a.period === Period.Last30Days,
  )
  const subscriptionReactivatedOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.SubscriptionReactivated && a.period === Period.Last30Days,
  )
  const userRegistrationOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.Register && a.period === Period.Last30Days,
  )
  const userDeletionOverTime = data.activityStatisticsOverTime.find(
    (a: { name: AnalyticsActivity; period: Period }) =>
      a.name === AnalyticsActivity.DeleteAccount && a.period === Period.Last30Days,
  )
  const incomeMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.Income && a.period === Period.Yesterday,
  )
  const refundMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.Refunds && a.period === Period.Yesterday,
  )
  const incomeYesterday = incomeMeasureYesterday?.totalValue ?? 0
  const refundsYesterday = refundMeasureYesterday?.totalValue ?? 0
  const revenueYesterday = incomeYesterday - refundsYesterday

  const subscriptionLengthMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.SubscriptionLength && a.period === Period.Yesterday,
  )
  const subscriptionLengthDurationYesterday = timer.convertMicrosecondsToTimeStructure(
    Math.floor(subscriptionLengthMeasureYesterday?.average ?? 0),
  )

  const subscriptionRemainingTimePercentageMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RemainingSubscriptionTimePercentage && a.period === Period.Yesterday,
  )
  const subscriptionRemainingTimePercentageYesterday = Math.floor(
    subscriptionRemainingTimePercentageMeasureYesterday?.average ?? 0,
  )

  const registrationLengthMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RegistrationLength && a.period === Period.Yesterday,
  )
  const registrationLengthDurationYesterday = timer.convertMicrosecondsToTimeStructure(
    Math.floor(registrationLengthMeasureYesterday?.average ?? 0),
  )

  const registrationToSubscriptionMeasureYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RegistrationToSubscriptionTime && a.period === Period.Yesterday,
  )
  const registrationToSubscriptionDurationYesterday = timer.convertMicrosecondsToTimeStructure(
    Math.floor(registrationToSubscriptionMeasureYesterday?.average ?? 0),
  )

  const incomeMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.Income && a.period === Period.ThisMonth,
  )
  const refundMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.Refunds && a.period === Period.ThisMonth,
  )
  const incomeThisMonth = incomeMeasureThisMonth?.totalValue ?? 0
  const refundsThisMonth = refundMeasureThisMonth?.totalValue ?? 0
  const revenueThisMonth = incomeThisMonth - refundsThisMonth

  const subscriptionLengthMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.SubscriptionLength && a.period === Period.ThisMonth,
  )
  const subscriptionLengthDurationThisMonth = timer.convertMicrosecondsToTimeStructure(
    Math.floor(subscriptionLengthMeasureThisMonth?.average ?? 0),
  )

  const subscriptionRemainingTimePercentageMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RemainingSubscriptionTimePercentage && a.period === Period.ThisMonth,
  )
  const subscriptionRemainingTimePercentageThisMonth = Math.floor(
    subscriptionRemainingTimePercentageMeasureThisMonth?.average ?? 0,
  )

  const registrationLengthMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RegistrationLength && a.period === Period.ThisMonth,
  )
  const registrationLengthDurationThisMonth = timer.convertMicrosecondsToTimeStructure(
    Math.floor(registrationLengthMeasureThisMonth?.average ?? 0),
  )

  const registrationToSubscriptionMeasureThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.RegistrationToSubscriptionTime && a.period === Period.ThisMonth,
  )
  const registrationToSubscriptionDurationThisMonth = timer.convertMicrosecondsToTimeStructure(
    Math.floor(registrationToSubscriptionMeasureThisMonth?.average ?? 0),
  )

  const plusSubscriptionsInitialAnnualPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionInitialAnnualPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const plusSubscriptionsInitialMonthlyPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionInitialMonthlyPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const plusSubscriptionsRenewingAnnualPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionRenewingAnnualPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const plusSubscriptionsRenewingMonthlyPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionRenewingMonthlyPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const proSubscriptionsInitialAnnualPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionInitialAnnualPaymentsIncome && a.period === Period.Yesterday,
  )
  const proSubscriptionsInitialMonthlyPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionInitialMonthlyPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const proSubscriptionsRenewingAnnualPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionRenewingAnnualPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const proSubscriptionsRenewingMonthlyPaymentsYesterday = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionRenewingMonthlyPaymentsIncome &&
      a.period === Period.Yesterday,
  )
  const plusSubscriptionsInitialAnnualPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionInitialAnnualPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const plusSubscriptionsInitialMonthlyPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionInitialMonthlyPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const plusSubscriptionsRenewingAnnualPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionRenewingAnnualPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const plusSubscriptionsRenewingMonthlyPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.PlusSubscriptionRenewingMonthlyPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const proSubscriptionsInitialAnnualPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionInitialAnnualPaymentsIncome && a.period === Period.ThisMonth,
  )
  const proSubscriptionsInitialMonthlyPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionInitialMonthlyPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const proSubscriptionsRenewingAnnualPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionRenewingAnnualPaymentsIncome &&
      a.period === Period.ThisMonth,
  )
  const proSubscriptionsRenewingMonthlyPaymentsThisMonth = data.statisticMeasures.find(
    (a: { name: string; period: Period }) =>
      a.name === StatisticMeasureName.NAMES.ProSubscriptionRenewingMonthlyPaymentsIncome &&
      a.period === Period.ThisMonth,
  )

  const mrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'mrr' && a.period === 27,
  )
  const monthlyPlansMrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'monthly-plans-mrr' && a.period === 27,
  )
  const annualPlansMrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'annual-plans-mrr' && a.period === 27,
  )
  const fiveYearPlansMrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'five-year-plans-mrr' && a.period === 27,
  )
  const proPlansMrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'pro-plans-mrr' && a.period === 27,
  )
  const plusPlansMrrOverTime = data.statisticsOverTime.find(
    (a: { name: string; period: number }) => a.name === 'plus-plans-mrr' && a.period === 27,
  )

  const today = new Date()
  const thisMonthPeriodKey = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString()}`
  const thisMonthChurn = data.churn.values.find(
    (value: { periodKey: string }) => value.periodKey === thisMonthPeriodKey,
  )

  const totalActiveUsers = countActiveUsers(StatisticMeasureName.NAMES.ActiveUsers, data)
  const totalActiveFreeUsers = countActiveUsers(StatisticMeasureName.NAMES.ActiveFreeUsers, data)
  const totalActivePlusUsers = countActiveUsers(StatisticMeasureName.NAMES.ActivePlusUsers, data)
  const totalActiveProUsers = countActiveUsers(StatisticMeasureName.NAMES.ActiveProUsers, data)

  return `      <div>
<p>Hello,</p>
<p>
  <strong>Here are some statistics from yesterday:</strong>
</p>
<ul>
  <li>
    <b>Active Users</b>
    <ul>
      <li>
        <b>Total:</b> ${totalActiveUsers.yesterday.toLocaleString('en-US')}
      </li>
      <li>
        <b>By Subscription Type:</b>
        <ul>
          <li>
            <b>FREE:</b> ${totalActiveFreeUsers.yesterday.toLocaleString('en-US')}
          </li>
          <li>
            <b>PLUS:</b> ${totalActivePlusUsers.yesterday.toLocaleString('en-US')}
          </li>
          <li>
            <b>PRO:</b> ${totalActiveProUsers.yesterday.toLocaleString('en-US')}
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <b>Payments</b>
    <ul>
      <li>
        Revenue: <b>$${revenueYesterday.toLocaleString('en-US')}</b> (Income: $
        ${incomeYesterday.toLocaleString('en-US')}, Refunds: $${refundsYesterday.toLocaleString('en-US')})
      </li>
      <li>
        Successfull payments: <b>${successfullPaymentsActivity?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Failed payments: <b>${failedPaymentsActivity?.totalCount.toLocaleString('en-US')}</b>
      </li>
    </ul>
  </li>
  <li>
    <b>MRR Breakdown</b>
    <ul>
      <li>
        <b>Total:</b> $${mrrOverTime?.counts[mrrOverTime?.counts.length - 1].totalCount.toLocaleString('en-US')}
      </li>
      <li>
        <b>By Subscription Type:</b>
        <ul>
          <li>
            <b>PLUS:</b> $
            ${plusPlansMrrOverTime?.counts[plusPlansMrrOverTime?.counts.length - 1].totalCount.toLocaleString('en-US')}
          </li>
          <li>
            <b>PRO:</b> $
            ${proPlansMrrOverTime?.counts[proPlansMrrOverTime?.counts.length - 1].totalCount.toLocaleString('en-US')}
          </li>
        </ul>
      </li>
      <li>
        <b>By Billing Frequency:</b>
        <ul>
          <li>
            <b>Monthly:</b> $
            ${monthlyPlansMrrOverTime?.counts[monthlyPlansMrrOverTime?.counts.length - 1].totalCount.toLocaleString(
              'en-US',
            )}
          </li>
          <li>
            <b>Annual:</b> $
            ${annualPlansMrrOverTime?.counts[annualPlansMrrOverTime?.counts.length - 1].totalCount.toLocaleString(
              'en-US',
            )}
          </li>
          <li>
            <b>5-year:</b> $
            ${fiveYearPlansMrrOverTime?.counts[fiveYearPlansMrrOverTime?.counts.length - 1].totalCount.toLocaleString(
              'en-US',
            )}
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <b>Income Breakdown</b>
    <ul>
      <li>
        <b>Plus Subscription:</b>
        <ul>
          <li>
            <b>${plusSubscriptionsInitialMonthlyPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>monhtly</u> plan, totaling${' '}
            <b>$${plusSubscriptionsInitialMonthlyPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsInitialAnnualPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${plusSubscriptionsInitialAnnualPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsRenewingMonthlyPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>monthly</u> plan, totaling${' '}
            <b>$${plusSubscriptionsRenewingMonthlyPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsRenewingAnnualPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${plusSubscriptionsRenewingAnnualPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
        </ul>
      </li>
      <li>
        <b>Pro Subscription:</b>
        <ul>
          <li>
            <b>${proSubscriptionsInitialMonthlyPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>monhtly</u> plan, totaling${' '}
            <b>$${proSubscriptionsInitialMonthlyPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsInitialAnnualPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${proSubscriptionsInitialAnnualPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsRenewingMonthlyPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>monthly</u> plan, totaling${' '}
            <b>$${proSubscriptionsRenewingMonthlyPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsRenewingAnnualPaymentsYesterday?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${proSubscriptionsRenewingAnnualPaymentsYesterday?.totalValue.toLocaleString('en-US')}</b>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <b>Users</b>
    <ul>
      <li>
        Number of users registered:${' '}
        <b>
          ${userRegistrationOverTime?.counts[userRegistrationOverTime?.counts.length - 1]?.totalCount.toLocaleString(
            'en-US',
          )}
        </b>
      </li>
      <li>
        Number of users unregistered:${' '}
        <b>
          ${userDeletionOverTime?.counts[userDeletionOverTime?.counts.length - 1]?.totalCount.toLocaleString('en-US')}
        </b>${' '}
        (average account duration: ${registrationLengthDurationYesterday.days} days${' '}
        ${registrationLengthDurationYesterday.hours} hours ${registrationLengthDurationYesterday.minutes} minutes)
      </li>
    </ul>
  </li>
  <li>
    <b>Subscriptions</b>
    <ul>
      <li>
        Number of subscriptions purchased:${' '}
        <b>
          ${subscriptionPurchasingOverTime?.counts[
            subscriptionPurchasingOverTime?.counts.length - 1
          ]?.totalCount.toLocaleString('en-US')}
        </b>${' '}
        (includes <b>${limitedDiscountPurchasedActivity?.totalCount.toLocaleString('en-US')}</b> limited time
        offer purchases)
      </li>
      <li>
        Number of subscriptions renewed:${' '}
        <b>
          ${subscriptionRenewingOverTime?.counts[
            subscriptionRenewingOverTime?.counts.length - 1
          ]?.totalCount.toLocaleString('en-US')}
        </b>
      </li>
      <li>
        Number of subscriptions refunded:${' '}
        <b>
          ${subscriptionRefundingOverTime?.counts[
            subscriptionRefundingOverTime?.counts.length - 1
          ]?.totalCount.toLocaleString('en-US')}
        </b>
      </li>
      <li>
        Number of subscriptions cancelled:${' '}
        <b>
          ${subscriptionCancelledOverTime?.counts[
            subscriptionCancelledOverTime?.counts.length - 1
          ]?.totalCount.toLocaleString('en-US')}
        </b>${' '}
        (average subscription duration: ${subscriptionLengthDurationYesterday.days} days${' '}
        ${subscriptionLengthDurationYesterday.hours} hours ${subscriptionLengthDurationYesterday.minutes} minutes,
        average remaining subscription percentage: ${subscriptionRemainingTimePercentageYesterday}%)
      </li>
      <li>
        Number of subscriptions reactivated:${' '}
        <b>
          ${subscriptionReactivatedOverTime?.counts[
            subscriptionReactivatedOverTime?.counts.length - 1
          ]?.totalCount.toLocaleString('en-US')}
        </b>
      </li>
      <li>
        Average time from registration to subscription purchase:${' '}
        <b>
          ${registrationToSubscriptionDurationYesterday.days} days${' '}
          ${registrationToSubscriptionDurationYesterday.hours} hours${' '}
          ${registrationToSubscriptionDurationYesterday.minutes} minutes
        </b>
      </li>
    </ul>
  </li>
</ul>
<p>
  <strong>Here are some statistics from last 30 days:</strong>
</p>
<ul>
  <li>
    <b>Active Users (Average)</b>
    <ul>
      <li>
        <b>Total:</b> ${totalActiveUsers.last30Days.toLocaleString('en-US')}
      </li>
      <li>
        <b>By Subscription Type:</b>
        <ul>
          <li>
            <b>FREE:</b> ${totalActiveFreeUsers.last30Days.toLocaleString('en-US')}
          </li>
          <li>
            <b>PLUS:</b> ${totalActivePlusUsers.last30Days.toLocaleString('en-US')}
          </li>
          <li>
            <b>PRO:</b> ${totalActiveProUsers.last30Days.toLocaleString('en-US')}
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <b>Payments (This Month)</b>
    <ul>
      <li>
        Revenue: <b>$${revenueThisMonth.toLocaleString('en-US')}</b>
      </li>
      <li>
        Income: <b>$${incomeThisMonth.toLocaleString('en-US')}</b>
      </li>
      <li>
        Refunds: <b>$${refundsThisMonth.toLocaleString('en-US')}</b>
      </li>
    </ul>
  </li>
  <li>
    <b>Income Breakdown (This Month)</b>
    <ul>
      <li>
        <b>Plus Subscription:</b>
        <ul>
          <li>
            <b>${plusSubscriptionsInitialMonthlyPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>monhtly</u> plan, totaling${' '}
            <b>$${plusSubscriptionsInitialMonthlyPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsInitialAnnualPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${plusSubscriptionsInitialAnnualPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsRenewingMonthlyPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>monthly</u> plan, totaling${' '}
            <b>$${plusSubscriptionsRenewingMonthlyPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${plusSubscriptionsRenewingAnnualPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${plusSubscriptionsRenewingAnnualPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
        </ul>
      </li>
      <li>
        <b>Pro Subscription:</b>
        <ul>
          <li>
            <b>${proSubscriptionsInitialMonthlyPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>monhtly</u> plan, totaling${' '}
            <b>$${proSubscriptionsInitialMonthlyPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsInitialAnnualPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>initial</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${proSubscriptionsInitialAnnualPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsRenewingMonthlyPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>monthly</u> plan, totaling${' '}
            <b>$${proSubscriptionsRenewingMonthlyPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
          <li>
            <b>${proSubscriptionsRenewingAnnualPaymentsThisMonth?.increments.toLocaleString('en-US')}</b>${' '}
            <i>renewing</i> payments on <u>annual</u> plan, totaling${' '}
            <b>$${proSubscriptionsRenewingAnnualPaymentsThisMonth?.totalValue.toLocaleString('en-US')}</b>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <b>Users</b>
    <ul>
      <li>
        Number of users registered: <b>${userRegistrationOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Number of users unregistered: <b>${userDeletionOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Average account duration this month:${' '}
        <b>
          ${registrationLengthDurationThisMonth.days} days ${registrationLengthDurationThisMonth.hours} hours${' '}
          ${registrationLengthDurationThisMonth.minutes} minutes
        </b>
      </li>
    </ul>
  </li>
  <li>
    <b>Subscriptions</b>
    <ul>
      <li>
        Number of subscriptions purchased:${' '}
        <b>${subscriptionPurchasingOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Number of subscriptions renewed:${' '}
        <b>${subscriptionRenewingOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Number of subscriptions refunded:${' '}
        <b>${subscriptionRefundingOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Number of subscriptions cancelled:${' '}
        <b>${subscriptionCancelledOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Number of subscriptions reactivated:${' '}
        <b>${subscriptionReactivatedOverTime?.totalCount.toLocaleString('en-US')}</b>
      </li>
      <li>
        Average subscription duration this month:${' '}
        <b>
          ${subscriptionLengthDurationThisMonth.days} days ${subscriptionLengthDurationThisMonth.hours} hours${' '}
          ${subscriptionLengthDurationThisMonth.minutes} minutes
        </b>
      </li>
      <li>
        Average subscription remaining percentage this month:${' '}
        <b>${subscriptionRemainingTimePercentageThisMonth}%</b>
      </li>
      <li>
        Average time from registration to subscription purchase this month:${' '}
        <b>
          ${registrationToSubscriptionDurationThisMonth.days} days${' '}
          ${registrationToSubscriptionDurationThisMonth.hours} hours${' '}
          ${registrationToSubscriptionDurationThisMonth.minutes} minutes
        </b>
      </li>
    </ul>
  </li>
</ul>
<p>
  <strong>Here is the MRR Monthly chart this year:</strong>
</p>
<img src=${chartUrls.mrrMonthly}></img>
<p>
  <strong>Here is the subscription chart over 30 days:</strong>
</p>
<img src=${chartUrls.subscriptions}></img>
<p>
  <strong>Here is the users chart over 30 days:</strong>
</p>
<img src=${chartUrls.users}></img>
<p>
  <strong>Here is the monthly churn rate percentage:</strong>
</p>
<p>✅ GREAT! Up to 7% 🔶 OKAY: 8-10% 🩸 BAD: 11 -15 % 🚨 TERRIBLE! 16-20%</p>
<p>Churn is calculated by the following formula:</p>
<p>
  ( Existing Customers Churn [${thisMonthChurn?.existingCustomersChurn}] + New Customers Churn [
  ${thisMonthChurn?.newCustomersChurn}] ) * 100 / Average Customers Count This Month [
  ${thisMonthChurn?.averageCustomersCount}]
</p>
<img src=${chartUrls.churn}></img>
<p>
  <strong>Here is quarterly performance chart:</strong>
</p>
<img src=${chartUrls.quarterlyPerformance}></img>
<p>Thanks,SN</p>
</div>`
}
