# Google Sheets Data Source

The Google Sheets source connector is designed to pull data from a single Google Sheets spreadsheet, providing a seamless way to integrate your spreadsheet data with a Model Context Protocol (MCP) enabled system. This connector is designed to access only the specified spreadsheet and does not require access to other files in your Google Drive.

## Prerequisites

To connect your Google Sheet as a data source, you will need the following:

-   **Spreadsheet Link:** A link to the Google Sheets spreadsheet you want to sync. This link can be obtained by clicking the "Share" button in the top-right corner of your spreadsheet and then selecting "Copy Link".
-   **Permissions:** You must have a Google Workspace user account with access to the specified spreadsheet.

## Authentication

The Google Sheets source connector supports two authentication methods:

-   **OAuth (Recommended):** This method is highly recommended as it simplifies the setup process by allowing you to authenticate directly from the user interface.
-   **Service Account Key:** An alternative method using a service account key for authentication.

## Setup Guide

Follow these steps to set up the Google Sheets connector:

1. **Create a New Source:** Navigate to the "Sources" section and select **+ New source**.
2. **Select Source Type:** From the Source type dropdown, select **Google Sheets**.
3. **Name the Source:** Enter a descriptive name for your connector.
4. **Select Authentication Method:**
    - Select **Authenticate via Google (OAuth)** from the Authentication dropdown.
    - Click **Sign in with Google** and complete the authentication workflow to grant access.
5. **Enter Spreadsheet Link:** For the Spreadsheet Link field, paste the link to your Google spreadsheet.
6. **Configure Batch Size (Optional):**
    - Enter an integer value for **Batch Size**. The default value is 1,000,000.
    - This value represents the number of rows processed in a single request to the Google Sheets API.
    - **Note on Performance:** The Google Sheets API limits requests to 300 per minute, with each request timing out after 180 seconds. When setting a batch size, consider your network speed and the number of columns in your spreadsheet to avoid timeout errors. A larger batch size may increase processing time per request but reduce the total number of requests.
7. **Convert Column Names (Optional):**
    - Check the box to enable the **Convert Column Names to SQL-Compliant Format** option.
    - Enabling this will automatically convert column names (e.g., `Café Earnings 2022` becomes `cafe_earnings_2022`). This is recommended if your target destination is a SQL-based database like PostgreSQL or MySQL.
8. **Finalize Setup:** Click **Set up source** and wait for the connection tests to complete.

Once the setup is complete and the connection is verified, you can begin syncing your data.
