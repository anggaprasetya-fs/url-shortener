BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [user_id] NVARCHAR(1000) NOT NULL,
    [user_email] VARCHAR(100) NOT NULL,
    [user_password] VARCHAR(255) NOT NULL,
    [user_created_at] DATETIME NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[short_url] (
    [url_id] NVARCHAR(1000) NOT NULL,
    [url_short_id] NVARCHAR(1000) NOT NULL,
    [url_original] TEXT NOT NULL,
    [url_user_id] NVARCHAR(1000) NOT NULL,
    [url_created_at] DATETIME NOT NULL,
    CONSTRAINT [short_url_pkey] PRIMARY KEY CLUSTERED ([url_id]),
    CONSTRAINT [short_url_url_short_id_key] UNIQUE NONCLUSTERED ([url_short_id])
);

-- CreateTable
CREATE TABLE [dbo].[click] (
    [click_id] NVARCHAR(1000) NOT NULL,
    [click_short_url_id] NVARCHAR(1000) NOT NULL,
    [click_timestamp] DATETIME2 NOT NULL CONSTRAINT [click_click_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [click_ip_address] VARCHAR(200) NOT NULL,
    [click_user_agent] VARCHAR(255) NOT NULL,
    CONSTRAINT [click_pkey] PRIMARY KEY CLUSTERED ([click_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[short_url] ADD CONSTRAINT [short_url_url_user_id_fkey] FOREIGN KEY ([url_user_id]) REFERENCES [dbo].[users]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[click] ADD CONSTRAINT [click_click_short_url_id_fkey] FOREIGN KEY ([click_short_url_id]) REFERENCES [dbo].[short_url]([url_short_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
