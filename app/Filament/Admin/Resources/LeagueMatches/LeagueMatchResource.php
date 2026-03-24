<?php

namespace App\Filament\Admin\Resources\LeagueMatches;

use App\Filament\Admin\Resources\LeagueMatches\Pages\ViewLeagueMatch;
use App\Filament\Admin\Resources\LeagueMatches\Schemas\LeagueMatchForm;
use App\Filament\Admin\Resources\LeagueMatches\Schemas\LeagueMatchInfolist;
use App\Filament\Admin\Resources\Streamers\StreamerResource;
use App\Models\LeagueMatch;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class LeagueMatchResource extends Resource
{
    /**
     * The resource model.
     *
     * @var class-string<LeagueMatch>|null
     */
    protected static ?string $model = LeagueMatch::class;

    /**
     * Whether this resource registers a navigation item.
     */
    protected static bool $shouldRegisterNavigation = false;

    /**
     * Configure the form schema for this resource.
     */
    public static function form(Schema $schema): Schema
    {
        return LeagueMatchForm::configure($schema);
    }

    /**
     * Configure the infolist schema used on the match view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return LeagueMatchInfolist::configure($schema);
    }

    /**
     * Configure the table for this resource.
     */
    public static function table(Table $table): Table
    {
        return $table->columns([]);
    }

    /**
     * Disable record creation for this resource.
     */
    public static function canCreate(): bool
    {
        return false;
    }

    /**
     * Override the index URL to redirect back to the Streamers resource index.
     *
     * @param  array<string, mixed>  $parameters
     */
    public static function getIndexUrl(
        array $parameters = [],
        bool $isAbsolute = true,
        ?string $panel = null,
        ?Model $tenant = null,
        bool $shouldGuessMissingParameters = false,
    ): string {
        return StreamerResource::getUrl('index');
    }

    /**
     * Return the pages registered for this resource.
     *
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'view' => ViewLeagueMatch::route('/{record}'),
        ];
    }
}
