BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[click] DROP CONSTRAINT [click_click_short_url_id_fkey];

-- AddForeignKey
ALTER TABLE [dbo].[click] ADD CONSTRAINT [click_click_short_url_id_fkey] FOREIGN KEY ([click_short_url_id]) REFERENCES [dbo].[short_url]([url_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
